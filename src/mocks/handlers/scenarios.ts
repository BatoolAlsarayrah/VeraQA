import {
  PriorityInput,
  ReasonInput,
  type Scenario,
  type ScenarioGenerationResult,
  ScenarioInput,
  type ScenarioSummary,
} from '@/types';

import { draftScenarios, vagueReason } from '../ai';
import { accepted, api, type Context, fail, getFlags } from '../api';
import { type Db, nextId, type ScenarioRecord } from '../db';
import { onJobDone, startJob } from '../jobs';
import { addActivity, by, event, notify } from '../log';
import { actor, body, can, found, inProject } from '../rules';
import { lastResult } from '../work';

const BASE = '/projects/:projectId/scenarios';

function summary(db: Db, record: ScenarioRecord): ScenarioSummary {
  const requirement = db.requirements.find(
    (entry) => entry.projectId === record.projectId && entry.id === record.requirementId,
  );
  return {
    id: record.id,
    title: record.title,
    type: record.type,
    priority: record.priority,
    status: record.status,
    origin: record.origin,
    requirement: { id: record.requirementId, title: requirement?.title ?? record.requirementId },
    testCases: db.testCases
      .filter((entry) => entry.projectId === record.projectId && entry.scenarioId === record.id)
      .map((entry) => ({
        id: entry.id,
        title: entry.title,
        status: entry.status,
        lastResult: lastResult(db, record.projectId, entry.id),
      })),
  };
}

function view(db: Db, record: ScenarioRecord): Scenario {
  return {
    ...summary(db, record),
    description: record.description,
    precondition: record.precondition,
    testData: record.testData,
    rejectionReason: record.rejectionReason,
    history: record.history.map((entry) => ({ ...entry, actor: actor(db, entry.actor) })),
  };
}

function load(context: Context, capability: Parameters<typeof inProject>[1]) {
  const access = inProject(context, capability);
  const id = context.params.scenarioId ?? '';
  const record = found(
    context.db.scenarios.find((entry) => entry.projectId === access.projectId && entry.id === id),
    id,
  );
  return { ...access, record };
}

function decide(
  db: Db,
  record: ScenarioRecord,
  personId: string,
  status: 'approved' | 'rejected',
  reason: string | null,
) {
  record.status = status;
  record.rejectionReason = reason;
  record.history.push(event(by(personId), status, reason));
  addActivity(db, {
    projectId: record.projectId,
    actor: by(personId),
    type: 'scenarios',
    action: status,
    item: { type: 'scenario', id: record.id, title: record.title },
  });
}

export function generationRunning(
  db: Db,
  projectId: string,
  kind: 'scenario-generation' | 'test-case-generation',
) {
  if (
    db.jobs.some(
      (job) => job.projectId === projectId && job.kind === kind && !job.finished && !job.cancelled,
    )
  ) {
    throw fail(
      409,
      'conflict',
      'Drafts are already being generated in this project. Wait for them to finish.',
    );
  }
}

onJobDone('scenario-generation', (db, job) => {
  const drafts = job.pending as ScenarioRecord[];
  for (const draft of drafts) {
    draft.history = [event({ type: 'ai' }, 'drafted')];
    db.scenarios.push(draft);
  }
  job.pending = [];
  const result = job.result as ScenarioGenerationResult | null;
  notify(db, {
    personId: job.createdBy,
    projectId: job.projectId,
    title: `${String(drafts.length)} scenario drafts are ready for review`,
    detail: `From ${String(result?.read ?? job.items.length)} approved requirements`,
    actor: { type: 'ai' },
    target: { type: 'scenario-generation', id: job.id },
  });
  const first = result?.groups[0]?.requirement;
  if (first) {
    addActivity(db, {
      projectId: job.projectId,
      actor: { type: 'ai' },
      type: 'ai',
      action: 'drafted',
      item: { type: 'requirement', id: first.id, title: first.title },
      count: drafts.length,
    });
  }
  const project = db.projects.find((entry) => entry.id === job.projectId);
  if (project && ['getting-started', 'reviewing-requirements'].includes(project.stage)) {
    project.stage = 'designing-tests';
  }
});

export const scenarioHandlers = [
  api.get(BASE, (context) => {
    const { projectId } = inProject(context, 'workspace');
    const query = context.url.searchParams;
    const status = query.get('status');
    const requirement = query.get('requirement');
    const search = query.get('search')?.toLowerCase() ?? '';
    return {
      items: context.db.scenarios
        .filter(
          (entry) =>
            entry.projectId === projectId &&
            (!status || entry.status === status) &&
            (!requirement || entry.requirementId === requirement) &&
            (!search || `${entry.id} ${entry.title}`.toLowerCase().includes(search)),
        )
        .map((entry) => summary(context.db, entry)),
    };
  }),

  api.post(`${BASE}/generate`, (context) => {
    const { me, projectId } = inProject(context, 'approve');
    const { db } = context;
    generationRunning(db, projectId, 'scenario-generation');
    const covered = new Set(
      db.scenarios
        .filter((entry) => entry.projectId === projectId)
        .map((entry) => entry.requirementId),
    );
    const requirements = db.requirements.filter(
      (entry) =>
        entry.projectId === projectId && entry.status === 'approved' && !covered.has(entry.id),
    );
    if (!requirements.length) {
      throw fail(
        409,
        'conflict',
        'Every approved requirement already has scenarios. Approve more requirements first.',
      );
    }
    const ids = db.scenarios
      .filter((entry) => entry.projectId === projectId)
      .map((entry) => entry.id);
    const pending: ScenarioRecord[] = [];
    const result: ScenarioGenerationResult = {
      drafted: 0,
      read: requirements.length,
      covered: 0,
      tooVague: [],
      groups: [],
    };
    for (const requirement of requirements) {
      const ref = { id: requirement.id, title: requirement.title };
      const reason = vagueReason(requirement);
      if (reason) {
        result.tooVague.push({ requirement: ref, reason });
        continue;
      }
      const drafts = draftScenarios(requirement).map((draft) => {
        const id = nextId('SC', ids);
        ids.push(id);
        return {
          ...draft,
          projectId,
          id,
          requirementId: requirement.id,
          testData: [],
          status: 'pending-review' as const,
          priority: null,
          origin: 'ai' as const,
          assigneeId: null,
          due: null,
          rejectionReason: null,
          history: [],
        };
      });
      pending.push(...drafts);
      result.groups.push({
        requirement: ref,
        scenarios: drafts.map((draft) => ({ id: draft.id, title: draft.title, type: draft.type })),
      });
    }
    result.drafted = pending.length;
    result.covered = result.groups.length;
    const job = startJob(db, {
      projectId,
      kind: 'scenario-generation',
      createdBy: me.id,
      items: requirements.map((entry) => entry.id),
      pending,
      result,
      instant: getFlags().instantJobs,
      steps: [
        {
          label: 'Reading the approved requirements',
          detail: `${String(result.read)} requirements read`,
        },
        { label: 'Drafting scenarios', detail: `${String(result.drafted)} scenarios drafted` },
        {
          label: 'Linking each scenario to its requirement',
          detail: `${String(result.covered)} requirements covered`,
        },
        {
          label: 'Saving them as AI drafts',
          detail: 'Nothing is approved until a person reviews it',
        },
      ],
    });
    return accepted({ jobId: job.id });
  }),

  api.post(`${BASE}/approve-all`, (context) => {
    const { me, projectId } = inProject(context, 'approve');
    const ready = context.db.scenarios.filter(
      (entry) => entry.projectId === projectId && entry.status === 'pending-review',
    );
    for (const record of ready) decide(context.db, record, me.id, 'approved', null);
    return { approved: ready.map((record) => record.id) };
  }),

  api.get(`${BASE}/:scenarioId`, (context) => {
    const { record } = load(context, 'workspace');
    return view(context.db, record);
  }),

  api.patch(`${BASE}/:scenarioId`, async (context) => {
    const { me, member, record } = load(context, 'edit');
    const input = await body(context.request, ScenarioInput);
    if (record.status === 'approved' && !can(member, 'approve')) {
      throw fail(
        409,
        'conflict',
        `${record.id} is approved. Ask a QA lead or the project manager to change it.`,
      );
    }
    Object.assign(record, input);
    if (record.status === 'rejected') {
      record.status = 'pending-review';
      record.rejectionReason = null;
    }
    record.history.push(event(by(me.id), 'edited'));
    return view(context.db, record);
  }),

  api.post(`${BASE}/:scenarioId/approve`, (context) => {
    const { me, record } = load(context, 'approve');
    if (record.status === 'approved')
      throw fail(409, 'conflict', `${record.id} is already approved.`);
    decide(context.db, record, me.id, 'approved', null);
    return view(context.db, record);
  }),

  api.post(`${BASE}/:scenarioId/reject`, async (context) => {
    const { me, record } = load(context, 'approve');
    const { reason } = await body(context.request, ReasonInput);
    if (record.status === 'rejected')
      throw fail(409, 'conflict', `${record.id} is already rejected.`);
    const builtOn = context.db.testCases.some(
      (entry) =>
        entry.projectId === record.projectId &&
        entry.scenarioId === record.id &&
        entry.status === 'approved',
    );
    if (builtOn) {
      throw fail(
        409,
        'conflict',
        `Approved test cases are built on ${record.id}, so it can’t be rejected now.`,
      );
    }
    decide(context.db, record, me.id, 'rejected', reason);
    return view(context.db, record);
  }),

  api.patch(`${BASE}/:scenarioId/priority`, async (context) => {
    const { me, record } = load(context, 'approve');
    const { priority } = await body(context.request, PriorityInput);
    record.priority = priority;
    record.history.push(event(by(me.id), 'priority-set', priority));
    return view(context.db, record);
  }),
];
