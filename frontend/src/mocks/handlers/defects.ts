import {
  AssignInput,
  type Defect,
  DefectInput,
  type DefectStatus,
  type DefectSummary,
  NoteInput,
  ReasonInput,
  RetestInput,
} from '@/types';

import { api, type Context, created, fail } from '../api';
import { type Db, type DefectRecord, nextId } from '../db';
import { addActivity, by, notify, now } from '../log';
import { body, can, found, inProject, type Member, membership, person } from '../rules';
import { waitingOn } from '../work';

const BASE = '/projects/:projectId/defects';
const invalid = 'Check the highlighted fields, then try again.';

const labels: Record<DefectStatus, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  fixed: 'Fixed',
  retest: 'in Retest',
  closed: 'Closed',
  reopened: 'Reopened',
  invalid: 'Invalid',
};

function testCaseRef(db: Db, record: DefectRecord) {
  const id = record.source?.testCaseId;
  const testCase = db.testCases.find(
    (entry) => entry.projectId === record.projectId && entry.id === id,
  );
  return testCase ? { id: testCase.id, title: testCase.title } : null;
}

function summary(db: Db, record: DefectRecord): DefectSummary {
  return {
    id: record.id,
    title: record.title,
    severity: record.severity,
    status: record.status,
    assignee: person(db, record.assigneeId),
    reporter: person(db, record.reporterId),
    testCase: testCaseRef(db, record),
    reportedAt: record.reportedAt,
    updatedAt: record.updatedAt,
  };
}

function view(db: Db, record: DefectRecord, member: Member): Defect {
  const testCase = testCaseRef(db, record);
  const run = record.source
    ? db.runs.find(
        (entry) => entry.projectId === record.projectId && entry.number === record.source?.run,
      )
    : undefined;
  const scenario = db.scenarios.find(
    (entry) =>
      entry.projectId === record.projectId &&
      entry.id ===
        db.testCases.find((item) => item.projectId === record.projectId && item.id === testCase?.id)
          ?.scenarioId,
  );
  const requirement = db.requirements.find(
    (entry) => entry.projectId === record.projectId && entry.id === scenario?.requirementId,
  );
  const waiting = waitingOn(record);
  return {
    ...summary(db, record),
    steps: record.steps,
    expected: record.expected,
    actual: record.actual,
    environment: record.environment,
    evidence: record.evidence,
    source:
      record.source && run && testCase
        ? { run: { number: run.number, name: run.name }, testCase, step: record.source.step }
        : null,
    trace:
      can(member, 'trace') && scenario && requirement
        ? {
            scenario: { id: scenario.id, title: scenario.title },
            requirement: { id: requirement.id, title: requirement.title },
          }
        : null,
    notes: record.notes.map((note) => ({
      kind: note.kind,
      author: person(db, note.authorId),
      text: note.text,
      at: note.at,
    })),
    retests: record.retests.map((retest) => ({
      n: retest.n,
      outcome: retest.outcome,
      by: person(db, retest.byId),
      note: retest.note,
      at: retest.at,
    })),
    history: record.history.map((entry) => ({
      at: entry.at,
      actor: person(db, entry.actorId),
      action: entry.action,
      status: entry.status,
      note: entry.note,
    })),
    waitingOn: waiting ? person(db, waiting) : null,
  };
}

function visible(member: Member, personId: string, record: DefectRecord) {
  return can(member, 'workspace') || record.assigneeId === personId;
}

function load(context: Context) {
  const access = inProject(context);
  const id = context.params.defectId ?? '';
  const record = context.db.defects.find(
    (entry) => entry.projectId === access.projectId && entry.id === id,
  );
  return {
    ...access,
    record: found(record && visible(access.member, access.me.id, record) ? record : undefined, id),
  };
}

function step(
  db: Db,
  record: DefectRecord,
  actorId: string,
  action: DefectRecord['history'][number]['action'],
  status: DefectStatus,
  note: string | null = null,
) {
  const at = now();
  record.status = status;
  record.updatedAt = at;
  record.history.push({ at, actorId, action, status, note });
  const activity = {
    'started-fixing': 'started-fixing',
    'marked-fixed': 'marked-fixed',
    'marked-invalid': 'marked-invalid',
    'retest-passed': 'retest-passed',
    'retest-failed': 'retest-failed',
    reopened: 'reopened',
  } as const;
  if (action in activity) {
    addActivity(db, {
      projectId: record.projectId,
      actor: by(actorId),
      type: action === 'marked-invalid' ? 'invalid' : 'defects',
      action: activity[action as keyof typeof activity],
      item: { type: 'defect', id: record.id, title: record.title },
    });
  }
}

function from(record: DefectRecord, allowed: DefectStatus[], verb: string) {
  if (!allowed.includes(record.status)) {
    throw fail(
      409,
      'conflict',
      `${record.id} is ${labels[record.status]}, so it can’t ${verb} now.`,
    );
  }
}

function assigneeOnly(db: Db, member: Member, personId: string, record: DefectRecord) {
  if (!can(member, 'fix')) {
    throw fail(
      403,
      'forbidden',
      'Your role in this project doesn’t allow that. Ask the project manager if you need it.',
    );
  }
  if (record.assigneeId !== personId) {
    const name = person(db, record.assigneeId).name;
    throw fail(
      403,
      'forbidden',
      `${record.id} is assigned to ${name}, so only ${name} can do that.`,
    );
  }
}

function tell(
  db: Db,
  record: DefectRecord,
  personId: string | null,
  actorId: string,
  title: string,
  detail: string | null,
) {
  if (!personId || personId === actorId) return;
  notify(db, {
    personId,
    projectId: record.projectId,
    title,
    detail,
    actor: by(actorId),
    target: { type: 'defect', id: record.id },
  });
}

function releaseBlocked(db: Db, record: DefectRecord, actorId: string) {
  for (const entry of db.entries) {
    if (entry.projectId !== record.projectId || entry.blocked?.defectId !== record.id) continue;
    if (entry.result !== 'blocked') continue;
    entry.readyToRunAgain = true;
    if (entry.assigneeId) {
      notify(db, {
        personId: entry.assigneeId,
        projectId: record.projectId,
        title: `${record.id} is closed. ${entry.testCaseId} can be run again.`,
        detail: record.title,
        actor: by(actorId),
        target: { type: 'my-work', id: null },
      });
    }
  }
}

function recordRetest(
  record: DefectRecord,
  outcome: 'passed' | 'failed',
  byId: string,
  note: string | null,
) {
  record.retests.push({ n: record.retests.length + 1, outcome, byId, note, at: record.updatedAt });
}

export function closeAfterRetest(
  db: Db,
  record: DefectRecord,
  actorId: string,
  note: string | null,
) {
  step(db, record, actorId, 'retest-passed', 'closed', note);
  recordRetest(record, 'passed', actorId, note);
  releaseBlocked(db, record, actorId);
  tell(
    db,
    record,
    record.assigneeId,
    actorId,
    `${record.id} passed retest and was closed`,
    record.title,
  );
}

export const defectHandlers = [
  api.get(BASE, (context) => {
    const { me, member, projectId } = inProject(context);
    const query = context.url.searchParams;
    const status = query.get('status');
    const severity = query.get('severity');
    const assignee = query.get('assignee') === 'me' ? me.id : query.get('assignee');
    const search = query.get('search')?.toLowerCase() ?? '';
    return {
      items: context.db.defects
        .filter(
          (entry) =>
            entry.projectId === projectId &&
            visible(member, me.id, entry) &&
            (!status || entry.status === status) &&
            (!severity || entry.severity === severity) &&
            (!assignee || entry.assigneeId === assignee) &&
            (!search || `${entry.id} ${entry.title}`.toLowerCase().includes(search)),
        )
        .map((entry) => summary(context.db, entry)),
    };
  }),

  api.post(BASE, async (context) => {
    const { me, member, projectId } = inProject(context, 'test');
    const input = await body(context.request, DefectInput);
    const { db } = context;
    const project = db.projects.find((entry) => entry.id === projectId);
    if (member.role === 'qa-engineer' && project?.settings.rules.engineersReportDefects === false) {
      throw fail(
        403,
        'forbidden',
        'In this project, a QA lead reports defects. Ask your QA lead to report it.',
      );
    }
    const assignee = db.memberships.find(
      (entry) => entry.projectId === projectId && entry.personId === input.assigneeId,
    );
    if (!assignee || !can(membership(db, assignee.personId, projectId), 'fix')) {
      throw fail(422, 'validation', invalid, { assigneeId: 'Choose a developer in this project.' });
    }
    const source = input.source;
    const entry = source
      ? db.entries.find(
          (item) =>
            item.projectId === projectId &&
            item.run === source.run &&
            item.testCaseId === source.testCaseId,
        )
      : undefined;
    if (source && !entry) {
      throw fail(422, 'validation', invalid, {
        source: `${source.testCaseId} isn’t in Run ${String(source.run)}.`,
      });
    }
    const id = nextId(
      'BUG',
      db.defects.filter((item) => item.projectId === projectId).map((item) => item.id),
    );
    const at = now();
    const record: DefectRecord = {
      projectId,
      id,
      title: input.title,
      severity: input.severity,
      status: 'open',
      assigneeId: input.assigneeId,
      reporterId: me.id,
      steps: input.steps,
      expected: input.expected,
      actual: input.actual,
      environment: input.environment,
      evidence: entry ? [...entry.evidence] : [],
      source,
      notes: [],
      retests: [],
      history: [{ at, actorId: me.id, action: 'reported', status: 'open', note: null }],
      reportedAt: at,
      updatedAt: at,
    };
    db.defects.push(record);
    tell(
      db,
      record,
      record.assigneeId,
      me.id,
      `${person(db, me.id).name} assigned you ${id}`,
      `${record.title}. ${labels.open}.`,
    );
    addActivity(db, {
      projectId,
      actor: by(me.id),
      type: 'defects',
      action: 'reported',
      item: { type: 'defect', id, title: record.title },
    });
    return created(view(db, record, member));
  }),

  api.get(`${BASE}/:defectId`, (context) => {
    const { member, record } = load(context);
    return view(context.db, record, member);
  }),

  api.post(`${BASE}/:defectId/start-fixing`, (context) => {
    const { me, member, record } = load(context);
    assigneeOnly(context.db, member, me.id, record);
    from(record, ['open', 'reopened'], 'be started');
    step(context.db, record, me.id, 'started-fixing', 'in-progress');
    tell(
      context.db,
      record,
      record.reporterId,
      me.id,
      `${person(context.db, me.id).name} started fixing ${record.id}`,
      record.title,
    );
    return view(context.db, record, member);
  }),

  api.post(`${BASE}/:defectId/mark-fixed`, async (context) => {
    const { me, member, record } = load(context);
    assigneeOnly(context.db, member, me.id, record);
    const { note } = await body(context.request, NoteInput);
    from(record, ['in-progress'], 'be marked as fixed');
    step(context.db, record, me.id, 'marked-fixed', 'fixed', note);
    record.notes.push({ kind: 'fix', authorId: me.id, text: note, at: record.updatedAt });
    tell(
      context.db,
      record,
      record.reporterId,
      me.id,
      `${person(context.db, me.id).name} marked ${record.id} as fixed`,
      `${note} Start the retest when you’re ready.`,
    );
    return view(context.db, record, member);
  }),

  api.post(`${BASE}/:defectId/mark-invalid`, async (context) => {
    const { me, member, record } = load(context);
    assigneeOnly(context.db, member, me.id, record);
    const { reason } = await body(context.request, ReasonInput);
    from(record, ['open', 'in-progress'], 'be marked as invalid');
    step(context.db, record, me.id, 'marked-invalid', 'invalid', reason);
    record.notes.push({ kind: 'invalid', authorId: me.id, text: reason, at: record.updatedAt });
    tell(
      context.db,
      record,
      record.reporterId,
      me.id,
      `${person(context.db, me.id).name} marked ${record.id} as invalid`,
      `${reason} Review the reason, and reopen it if you disagree.`,
    );
    return view(context.db, record, member);
  }),

  api.post(`${BASE}/:defectId/start-retest`, (context) => {
    const { me, member, record } = load(context);
    if (!can(member, 'test'))
      throw fail(403, 'forbidden', 'Your role in this project doesn’t allow that.');
    from(record, ['fixed'], 'go to retest');
    step(context.db, record, me.id, 'started-retest', 'retest');
    tell(
      context.db,
      record,
      record.assigneeId,
      me.id,
      `${person(context.db, me.id).name} started the retest of ${record.id}`,
      record.title,
    );
    return view(context.db, record, member);
  }),

  api.post(`${BASE}/:defectId/retest`, async (context) => {
    const { me, member, record } = load(context);
    if (!can(member, 'test'))
      throw fail(403, 'forbidden', 'Your role in this project doesn’t allow that.');
    const input = await body(context.request, RetestInput);
    from(record, ['retest'], 'get a retest result');
    if (input.outcome === 'passed') {
      closeAfterRetest(context.db, record, me.id, input.note);
      return view(context.db, record, member);
    }
    step(context.db, record, me.id, 'retest-failed', 'reopened', input.note);
    recordRetest(record, 'failed', me.id, input.note);
    tell(
      context.db,
      record,
      record.assigneeId,
      me.id,
      `${record.id} failed retest and was reopened`,
      input.note,
    );
    return view(context.db, record, member);
  }),

  api.post(`${BASE}/:defectId/reopen`, async (context) => {
    const { me, member, record } = load(context);
    if (!can(member, 'test'))
      throw fail(403, 'forbidden', 'Your role in this project doesn’t allow that.');
    const { note } = await body(context.request, NoteInput);
    from(record, ['closed', 'invalid'], 'be reopened');
    step(context.db, record, me.id, 'reopened', 'reopened', note);
    tell(
      context.db,
      record,
      record.assigneeId,
      me.id,
      `${person(context.db, me.id).name} reopened ${record.id}`,
      note,
    );
    return view(context.db, record, member);
  }),

  api.post(`${BASE}/:defectId/assign`, async (context) => {
    const { me, member, projectId, record } = load(context);
    if (!can(member, 'manage'))
      throw fail(403, 'forbidden', 'Your role in this project doesn’t allow that.');
    const input = await body(context.request, AssignInput);
    const next = context.db.memberships.find(
      (entry) => entry.projectId === projectId && entry.personId === input.assigneeId,
    );
    if (!next || !can(membership(context.db, next.personId, projectId), 'fix')) {
      throw fail(422, 'validation', invalid, { assigneeId: 'Choose a developer in this project.' });
    }
    from(record, ['open', 'in-progress', 'reopened'], 'be reassigned');
    record.assigneeId = input.assigneeId;
    record.updatedAt = now();
    record.history.push({
      at: record.updatedAt,
      actorId: me.id,
      action: 'assigned',
      status: record.status,
      note: person(context.db, input.assigneeId).name,
    });
    tell(
      context.db,
      record,
      input.assigneeId,
      me.id,
      `${person(context.db, me.id).name} assigned you ${record.id}`,
      record.title,
    );
    return view(context.db, record, member);
  }),
];
