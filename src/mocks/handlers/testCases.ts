import {
  PriorityInput,
  ReasonInput,
  type TestCase,
  type TestCaseGenerationResult,
  TestCaseInput,
  type TestCaseSummary,
} from '@/types';

import { draftTestCases, testDataReason } from '../ai';
import { accepted, api, type Context, fail, getFlags } from '../api';
import { type Db, nextId, type TestCaseRecord } from '../db';
import { onJobDone, startJob } from '../jobs';
import { addActivity, by, event, notify } from '../log';
import { actor, body, can, found, inProject, person } from '../rules';
import { entriesFor, lastResult } from '../work';
import { generationRunning } from './scenarios';

const BASE = '/projects/:projectId/test-cases';

function assigneeOf(db: Db, record: TestCaseRecord) {
  const active = new Set(
    db.runs
      .filter((run) => run.projectId === record.projectId && run.status === 'active')
      .map((run) => run.number),
  );
  const entry = entriesFor(db, record.projectId, record.id).find((item) => active.has(item.run));
  return entry?.assigneeId ?? record.assigneeId;
}

function summary(db: Db, record: TestCaseRecord): TestCaseSummary {
  const scenario = db.scenarios.find(
    (entry) => entry.projectId === record.projectId && entry.id === record.scenarioId,
  );
  const assignee = assigneeOf(db, record);
  return {
    id: record.id,
    title: record.title,
    type: record.type,
    priority: record.priority,
    status: record.status,
    origin: record.origin,
    lastResult: lastResult(db, record.projectId, record.id),
    scenario: { id: record.scenarioId, title: scenario?.title ?? record.scenarioId },
    assignee: assignee ? person(db, assignee) : null,
  };
}

function view(db: Db, record: TestCaseRecord): TestCase {
  const scenario = db.scenarios.find(
    (entry) => entry.projectId === record.projectId && entry.id === record.scenarioId,
  );
  const requirement = db.requirements.find(
    (entry) => entry.projectId === record.projectId && entry.id === scenario?.requirementId,
  );
  if (!requirement) throw new Error(`Mock data has no requirement for ${record.id}`);
  return {
    ...summary(db, record),
    requirement: { id: requirement.id, title: requirement.title },
    precondition: record.precondition,
    testData: record.testData,
    steps: record.steps,
    runs: entriesFor(db, record.projectId, record.id).map((entry) => {
      const run = db.runs.find(
        (item) => item.projectId === record.projectId && item.number === entry.run,
      );
      return {
        number: entry.run,
        name: run?.name ?? `Run ${String(entry.run)}`,
        result: entry.result,
        failedStep:
          entry.steps.find((step) => step.result === 'failed' || step.result === 'blocked')?.n ??
          null,
        at: entry.recordedAt,
      };
    }),
    defects: db.defects
      .filter(
        (defect) =>
          defect.projectId === record.projectId && defect.source?.testCaseId === record.id,
      )
      .map((defect) => ({ id: defect.id, title: defect.title, status: defect.status })),
    rejectionReason: record.rejectionReason,
    history: record.history.map((entry) => ({ ...entry, actor: actor(db, entry.actor) })),
  };
}

function load(context: Context, capability: Parameters<typeof inProject>[1]) {
  const access = inProject(context, capability);
  const id = context.params.testCaseId ?? '';
  const record = found(
    context.db.testCases.find((entry) => entry.projectId === access.projectId && entry.id === id),
    id,
  );
  return { ...access, record };
}

function decide(
  db: Db,
  record: TestCaseRecord,
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
    type: 'test-cases',
    action: status,
    item: { type: 'test-case', id: record.id, title: record.title },
  });
}

onJobDone('test-case-generation', (db, job) => {
  const drafts = job.pending as TestCaseRecord[];
  for (const draft of drafts) {
    draft.history = [event({ type: 'ai' }, 'drafted')];
    db.testCases.push(draft);
  }
  job.pending = [];
  const result = job.result as TestCaseGenerationResult | null;
  notify(db, {
    personId: job.createdBy,
    projectId: job.projectId,
    title: `${String(drafts.length)} test case drafts are ready for review`,
    detail: `From ${String(result?.read ?? job.items.length)} approved scenarios`,
    actor: { type: 'ai' },
    target: { type: 'test-case-generation', id: job.id },
  });
  const first = result?.groups[0]?.scenario;
  if (first) {
    addActivity(db, {
      projectId: job.projectId,
      actor: { type: 'ai' },
      type: 'ai',
      action: 'drafted',
      item: { type: 'scenario', id: first.id, title: first.title },
      count: drafts.length,
    });
  }
});

export const testCaseHandlers = [
  api.get(BASE, (context) => {
    const { projectId } = inProject(context, 'workspace');
    const { db } = context;
    const query = context.url.searchParams;
    const status = query.get('status');
    const scenario = query.get('scenario');
    const result = query.get('result');
    const search = query.get('search')?.toLowerCase() ?? '';
    return {
      items: db.testCases
        .filter(
          (entry) =>
            entry.projectId === projectId &&
            (!status || entry.status === status) &&
            (!scenario || entry.scenarioId === scenario) &&
            (!search || `${entry.id} ${entry.title}`.toLowerCase().includes(search)),
        )
        .map((entry) => summary(db, entry))
        .filter((entry) => !result || entry.lastResult === result),
    };
  }),

  api.post(`${BASE}/generate`, (context) => {
    const { me, projectId } = inProject(context, 'approve');
    const { db } = context;
    generationRunning(db, projectId, 'test-case-generation');
    const covered = new Set(
      db.testCases
        .filter((entry) => entry.projectId === projectId)
        .map((entry) => entry.scenarioId),
    );
    const scenarios = db.scenarios.filter(
      (entry) =>
        entry.projectId === projectId && entry.status === 'approved' && !covered.has(entry.id),
    );
    if (!scenarios.length) {
      throw fail(
        409,
        'conflict',
        'Every approved scenario already has test cases. Approve more scenarios first.',
      );
    }
    const ids = db.testCases
      .filter((entry) => entry.projectId === projectId)
      .map((entry) => entry.id);
    const pending: TestCaseRecord[] = [];
    const result: TestCaseGenerationResult = {
      drafted: 0,
      read: scenarios.length,
      covered: 0,
      needsTestData: [],
      groups: [],
    };
    for (const scenario of scenarios) {
      const ref = { id: scenario.id, title: scenario.title };
      const reason = testDataReason(scenario);
      if (reason) {
        result.needsTestData.push({ scenario: ref, reason });
        continue;
      }
      const drafts = draftTestCases(scenario).map((draft) => {
        const id = nextId('TC', ids);
        ids.push(id);
        return {
          ...draft,
          projectId,
          id,
          scenarioId: scenario.id,
          precondition: scenario.precondition,
          testData: scenario.testData,
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
        scenario: ref,
        testCases: drafts.map((draft) => ({ id: draft.id, title: draft.title, type: draft.type })),
      });
    }
    result.drafted = pending.length;
    result.covered = result.groups.length;
    const job = startJob(db, {
      projectId,
      kind: 'test-case-generation',
      createdBy: me.id,
      items: scenarios.map((entry) => entry.id),
      pending,
      result,
      instant: getFlags().instantJobs,
      steps: [
        {
          label: 'Reading the approved scenarios',
          detail: `${String(result.read)} scenarios read`,
        },
        {
          label: 'Writing steps and test data',
          detail: `${String(result.drafted)} test cases drafted`,
        },
        {
          label: 'Linking each test case to its scenario',
          detail: `${String(result.covered)} scenarios covered`,
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
    const ready = context.db.testCases.filter(
      (entry) => entry.projectId === projectId && entry.status === 'pending-review',
    );
    for (const record of ready) decide(context.db, record, me.id, 'approved', null);
    return { approved: ready.map((record) => record.id) };
  }),

  api.get(`${BASE}/:testCaseId`, (context) => {
    const { record } = load(context, 'workspace');
    return view(context.db, record);
  }),

  api.patch(`${BASE}/:testCaseId`, async (context) => {
    const { me, member, record } = load(context, 'edit');
    const input = await body(context.request, TestCaseInput);
    if (record.status === 'approved' && !can(member, 'approve')) {
      throw fail(
        409,
        'conflict',
        `${record.id} is approved. Ask a QA lead or the project manager to change it.`,
      );
    }
    record.title = input.title;
    record.type = input.type;
    record.precondition = input.precondition;
    record.testData = input.testData;
    record.steps = input.steps.map((step, index) => ({ n: index + 1, ...step }));
    if (record.status === 'rejected') {
      record.status = 'pending-review';
      record.rejectionReason = null;
    }
    record.history.push(event(by(me.id), 'edited'));
    return view(context.db, record);
  }),

  api.post(`${BASE}/:testCaseId/approve`, (context) => {
    const { me, record } = load(context, 'approve');
    if (record.status === 'approved')
      throw fail(409, 'conflict', `${record.id} is already approved.`);
    decide(context.db, record, me.id, 'approved', null);
    return view(context.db, record);
  }),

  api.post(`${BASE}/:testCaseId/reject`, async (context) => {
    const { me, record } = load(context, 'approve');
    const { reason } = await body(context.request, ReasonInput);
    if (record.status === 'rejected')
      throw fail(409, 'conflict', `${record.id} is already rejected.`);
    if (
      entriesFor(context.db, record.projectId, record.id).some(
        (entry) => entry.result !== 'not-run',
      )
    ) {
      throw fail(
        409,
        'conflict',
        `${record.id} already has test results, so it can’t be rejected now.`,
      );
    }
    decide(context.db, record, me.id, 'rejected', reason);
    return view(context.db, record);
  }),

  api.patch(`${BASE}/:testCaseId/priority`, async (context) => {
    const { me, record } = load(context, 'approve');
    const { priority } = await body(context.request, PriorityInput);
    record.priority = priority;
    record.history.push(event(by(me.id), 'priority-set', priority));
    return view(context.db, record);
  }),
];
