import {
  EntryInput,
  EvidenceFile,
  ResultInput,
  type Run,
  RunInput,
  type RunSummary,
  type RunTest,
  RunUpdateInput,
  type TestResult,
} from '@/types';

import { api, type Context, created, fail } from '../api';
import type { Db, EntryRecord, RunRecord } from '../db';
import { addActivity, by, notify, now } from '../log';
import { body, can, found, inProject, membership, person } from '../rules';

const BASE = '/projects/:projectId/runs';
const invalid = 'Check the highlighted fields, then try again.';

function counts(entries: EntryRecord[]) {
  const count = (result: TestResult) => entries.filter((entry) => entry.result === result).length;
  return {
    passed: count('passed'),
    failed: count('failed'),
    blocked: count('blocked'),
    notRun: count('not-run'),
  };
}

function entriesOf(db: Db, run: RunRecord) {
  return db.entries.filter(
    (entry) => entry.projectId === run.projectId && entry.run === run.number,
  );
}

function summary(db: Db, run: RunRecord): RunSummary {
  return {
    number: run.number,
    name: run.name,
    environment: run.environment,
    status: run.status,
    startedAt: run.startedAt,
    closedAt: run.closedAt,
    counts: counts(entriesOf(db, run)),
  };
}

function defectRef(db: Db, projectId: string, id: string | null) {
  const defect = id
    ? db.defects.find((entry) => entry.projectId === projectId && entry.id === id)
    : null;
  return defect ? { id: defect.id, title: defect.title, status: defect.status } : null;
}

function blockedView(db: Db, entry: EntryRecord) {
  if (!entry.blocked) return null;
  const { defectId, ...rest } = entry.blocked;
  return { ...rest, defect: defectRef(db, entry.projectId, defectId) };
}

function chain(db: Db, projectId: string, testCaseId: string) {
  const testCase = db.testCases.find(
    (entry) => entry.projectId === projectId && entry.id === testCaseId,
  );
  const scenario = db.scenarios.find(
    (entry) => entry.projectId === projectId && entry.id === testCase?.scenarioId,
  );
  const requirement = db.requirements.find(
    (entry) => entry.projectId === projectId && entry.id === scenario?.requirementId,
  );
  if (!testCase || !scenario || !requirement) {
    throw new Error(`Mock data has a broken chain for ${testCaseId}`);
  }
  return { testCase, scenario, requirement };
}

function view(db: Db, run: RunRecord): Run {
  return {
    ...summary(db, run),
    entries: entriesOf(db, run).map((entry) => {
      const { testCase, scenario } = chain(db, run.projectId, entry.testCaseId);
      return {
        testCase: { id: testCase.id, title: testCase.title },
        scenario: { id: scenario.id, title: scenario.title },
        assignee: entry.assigneeId ? person(db, entry.assigneeId) : null,
        result: entry.result,
        blocked: blockedView(db, entry),
        readyToRunAgain: entry.readyToRunAgain,
      };
    }),
  };
}

function testView(db: Db, run: RunRecord, entry: EntryRecord): RunTest {
  const { testCase, scenario, requirement } = chain(db, run.projectId, entry.testCaseId);
  const project = db.projects.find((item) => item.id === run.projectId);
  const defect = db.defects.find(
    (item) =>
      item.projectId === run.projectId &&
      item.source?.run === run.number &&
      item.source.testCaseId === entry.testCaseId,
  );
  return {
    run: { number: run.number, name: run.name, environment: run.environment },
    testCase: {
      id: testCase.id,
      title: testCase.title,
      precondition: testCase.precondition,
      testData: testCase.testData,
      steps: testCase.steps,
    },
    scenario: { id: scenario.id, title: scenario.title },
    requirement: { id: requirement.id, title: requirement.title },
    assignee: entry.assigneeId ? person(db, entry.assigneeId) : null,
    result: entry.result,
    environment: entry.environment,
    steps: entry.steps,
    blocked: blockedView(db, entry),
    evidence: entry.evidence,
    defect: defect ? { id: defect.id, title: defect.title, status: defect.status } : null,
    environments: project?.settings.environments ?? [run.environment],
    recordedBy: entry.recordedBy ? person(db, entry.recordedBy) : null,
    recordedAt: entry.recordedAt,
  };
}

function loadRun(context: Context, capability: Parameters<typeof inProject>[1]) {
  const access = inProject(context, capability);
  const number = Number(context.params.run);
  const run = found(
    context.db.runs.find(
      (entry) => entry.projectId === access.projectId && entry.number === number,
    ),
    `Run ${String(context.params.run)}`,
  );
  return { ...access, run };
}

function loadEntry(context: Context, capability: Parameters<typeof inProject>[1]) {
  const access = loadRun(context, capability);
  const id = context.params.testCaseId ?? '';
  const entry = found(
    entriesOf(context.db, access.run).find((item) => item.testCaseId === id),
    `${id} in Run ${String(access.run.number)}`,
  );
  return { ...access, entry };
}

function active(run: RunRecord) {
  if (run.status === 'closed') {
    throw fail(
      409,
      'conflict',
      `Run ${String(run.number)} is closed. Start a new run to test again.`,
    );
  }
}

function tester(db: Db, projectId: string, personId: string | null, field: string) {
  if (!personId) return;
  const ok =
    db.memberships.some((entry) => entry.projectId === projectId && entry.personId === personId) &&
    can(membership(db, personId, projectId), 'test');
  if (!ok)
    throw fail(422, 'validation', invalid, {
      [field]: 'Choose someone in this project who can run tests.',
    });
}

function overall(steps: { result: TestResult }[]): 'passed' | 'failed' | 'blocked' | null {
  if (steps.some((step) => step.result === 'failed')) return 'failed';
  if (steps.some((step) => step.result === 'blocked')) return 'blocked';
  if (steps.every((step) => step.result === 'passed')) return 'passed';
  return null;
}

export const runHandlers = [
  api.get(BASE, (context) => {
    const { projectId } = inProject(context, 'workspace');
    return {
      items: context.db.runs
        .filter((run) => run.projectId === projectId)
        .sort((a, b) => b.number - a.number)
        .map((run) => summary(context.db, run)),
    };
  }),

  api.post(BASE, async (context) => {
    const { me, projectId } = inProject(context, 'manage');
    const input = await body(context.request, RunInput);
    const { db } = context;
    for (const [index, entry] of input.entries.entries()) {
      const testCase = db.testCases.find(
        (item) => item.projectId === projectId && item.id === entry.testCaseId,
      );
      if (testCase?.status !== 'approved') {
        throw fail(422, 'validation', invalid, {
          [`entries.${String(index)}.testCaseId`]: `${entry.testCaseId} isn’t approved, so it can’t be run yet.`,
        });
      }
      tester(db, projectId, entry.assigneeId, `entries.${String(index)}.assigneeId`);
    }
    const number =
      Math.max(
        0,
        ...db.runs.filter((run) => run.projectId === projectId).map((run) => run.number),
      ) + 1;
    const run: RunRecord = {
      projectId,
      number,
      name: input.name,
      environment: input.environment,
      status: 'active',
      startedAt: now(),
      closedAt: null,
    };
    db.runs.push(run);
    for (const entry of input.entries) {
      db.entries.push({
        projectId,
        run: number,
        testCaseId: entry.testCaseId,
        assigneeId: entry.assigneeId,
        due: null,
        result: 'not-run',
        environment: null,
        steps: [],
        blocked: null,
        evidence: [],
        recordedBy: null,
        recordedAt: null,
        readyToRunAgain: false,
      });
    }
    const assignees = new Set(
      input.entries.flatMap((entry) => (entry.assigneeId ? [entry.assigneeId] : [])),
    );
    for (const assignee of assignees) {
      if (assignee === me.id) continue;
      const mine = input.entries
        .filter((entry) => entry.assigneeId === assignee)
        .map((entry) => entry.testCaseId);
      notify(db, {
        personId: assignee,
        projectId,
        title: `${person(db, me.id).name} assigned you ${String(mine.length)} test ${mine.length === 1 ? 'case' : 'cases'}`,
        detail: `Run ${String(number)} · ${input.name}: ${mine.slice(0, 3).join(', ')}${mine.length > 3 ? ' and more' : ''}.`,
        actor: by(me.id),
        target: { type: 'run', id: String(number) },
      });
    }
    addActivity(db, {
      projectId,
      actor: by(me.id),
      type: 'runs',
      action: 'started-run',
      item: { type: 'run', id: String(number), title: input.name },
    });
    const project = db.projects.find((entry) => entry.id === projectId);
    if (
      project &&
      ['getting-started', 'reviewing-requirements', 'designing-tests'].includes(project.stage)
    ) {
      project.stage = 'running-tests';
    }
    return created(view(db, run));
  }),

  api.get(`${BASE}/:run`, (context) => {
    const { run } = loadRun(context, 'workspace');
    return view(context.db, run);
  }),

  api.patch(`${BASE}/:run`, async (context) => {
    const { run } = loadRun(context, 'manage');
    await body(context.request, RunUpdateInput);
    active(run);
    run.status = 'closed';
    run.closedAt = now();
    return view(context.db, run);
  }),

  api.patch(`${BASE}/:run/entries/:testCaseId`, async (context) => {
    const { projectId, run, entry } = loadEntry(context, 'manage');
    const input = await body(context.request, EntryInput);
    active(run);
    tester(context.db, projectId, input.assigneeId, 'assigneeId');
    entry.assigneeId = input.assigneeId;
    return view(context.db, run);
  }),

  api.get(`${BASE}/:run/tests/:testCaseId`, (context) => {
    const { run, entry } = loadEntry(context, 'test');
    return testView(context.db, run, entry);
  }),

  api.put(`${BASE}/:run/tests/:testCaseId/result`, async (context) => {
    const { me, projectId, run, entry } = loadEntry(context, 'test');
    const input = await body(context.request, ResultInput);
    const { db } = context;
    active(run);
    const { testCase } = chain(db, projectId, entry.testCaseId);
    if (input.steps.length !== testCase.steps.length) {
      throw fail(422, 'validation', invalid, { steps: 'Record a result for every step.' });
    }
    const result = overall(input.steps);
    if (!result) {
      throw fail(422, 'validation', invalid, {
        steps: 'Finish every step, or mark the step that failed or is blocked.',
      });
    }
    if (input.blocked?.defectId) {
      const blocking = db.defects.find(
        (item) => item.projectId === projectId && item.id === input.blocked?.defectId,
      );
      if (!blocking) {
        throw fail(422, 'validation', invalid, {
          'blocked.defectId': `${input.blocked.defectId} doesn’t exist in this project.`,
        });
      }
      if (blocking.status === 'closed') {
        throw fail(422, 'validation', invalid, {
          'blocked.defectId': `${blocking.id} is closed, so it can’t block this test. Run the test, or choose another reason.`,
        });
      }
    }
    entry.result = result;
    entry.environment = input.environment;
    entry.steps = input.steps;
    entry.blocked = input.blocked
      ? {
          step: input.steps.find((step) => step.result === 'blocked')?.n ?? 1,
          reason: input.blocked.reason,
          details: input.blocked.details,
          defectId: input.blocked.defectId,
        }
      : null;
    entry.recordedBy = me.id;
    entry.recordedAt = now();
    entry.readyToRunAgain = false;
    addActivity(db, {
      projectId,
      actor: by(me.id),
      type: result === 'blocked' ? 'blocked' : 'runs',
      action: result,
      item: { type: 'test-case', id: testCase.id, title: testCase.title },
    });
    return testView(db, run, entry);
  }),

  api.post(`${BASE}/:run/tests/:testCaseId/evidence`, async (context) => {
    const { run, entry } = loadEntry(context, 'test');
    active(run);
    const form = await context.request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      throw fail(422, 'validation', invalid, { file: 'Choose an image first.' });
    }
    const check = EvidenceFile.safeParse({ name: file.name, size: file.size });
    if (!check.success) {
      throw fail(422, 'validation', invalid, {
        file: check.error.issues[0]?.message ?? 'This file can’t be used.',
      });
    }
    const attachment = {
      id: `ev-${crypto.randomUUID()}`,
      name: file.name,
      size: file.size,
      type: file.type || 'image/png',
    };
    entry.evidence.push(attachment);
    return created(attachment);
  }),
];
