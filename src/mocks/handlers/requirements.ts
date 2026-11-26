import {
  PriorityInput,
  ReasonInput,
  type Requirement,
  RequirementInput,
  type RequirementSummary,
  SrsFile,
  TypedRequirementsInput,
} from '@/types';

import { analyze, lines } from '../ai';
import { accepted, api, type Context, fail } from '../api';
import { getFlags } from '../api';
import { type Db, nextId, type RequirementRecord } from '../db';
import { onJobDone, startJob } from '../jobs';
import { addActivity, by, event, notify, now } from '../log';
import { actor, body, found, inProject, person } from '../rules';

const BASE = '/projects/:projectId/requirements';

export function summary(db: Db, record: RequirementRecord): RequirementSummary {
  return {
    id: record.id,
    title: record.title,
    text: record.text,
    section: record.section,
    status: record.status,
    priority: record.priority,
    openFindings: record.findings.filter((finding) => !finding.resolved).length,
    assignee: record.assigneeId ? person(db, record.assigneeId) : null,
  };
}

function view(db: Db, record: RequirementRecord): Requirement {
  return {
    ...summary(db, record),
    type: record.type,
    origin: record.origin,
    confidence: record.confidence,
    source: record.source,
    findings: record.findings,
    rewrite: record.rewrite ? { text: record.rewrite } : null,
    rejectionReason: record.rejectionReason,
    decidedBy: record.decidedBy ? person(db, record.decidedBy) : null,
    decidedAt: record.decidedAt,
    scenarios: db.scenarios
      .filter((entry) => entry.projectId === record.projectId && entry.requirementId === record.id)
      .map((entry) => ({ id: entry.id, title: entry.title, status: entry.status })),
    history: record.history.map((entry) => ({ ...entry, actor: actor(db, entry.actor) })),
  };
}

function load(context: Context, capability: Parameters<typeof inProject>[1]) {
  const access = inProject(context, capability);
  const id = context.params.requirementId ?? '';
  const record = found(
    context.db.requirements.find(
      (entry) => entry.projectId === access.projectId && entry.id === id,
    ),
    id,
  );
  return { ...access, record };
}

function builtOn(db: Db, record: RequirementRecord) {
  return db.scenarios.some(
    (entry) =>
      entry.projectId === record.projectId &&
      entry.requirementId === record.id &&
      entry.status === 'approved',
  );
}

function decide(
  db: Db,
  record: RequirementRecord,
  personId: string,
  status: 'approved' | 'rejected',
  reason: string | null,
) {
  record.status = status;
  record.rejectionReason = reason;
  record.decidedBy = personId;
  record.decidedAt = now();
  record.history.push(event(by(personId), status, reason));
  addActivity(db, {
    projectId: record.projectId,
    actor: by(personId),
    type: 'requirements',
    action: status,
    item: { type: 'requirement', id: record.id, title: record.title },
  });
}

function analysisRunning(db: Db, projectId: string) {
  if (
    db.jobs.some(
      (job) =>
        job.projectId === projectId && job.kind === 'analysis' && !job.finished && !job.cancelled,
    )
  ) {
    throw fail(
      409,
      'conflict',
      'An analysis is already running in this project. Wait for it to finish, then add more.',
    );
  }
}

function startAnalysis(
  db: Db,
  projectId: string,
  personId: string,
  input: { files: { name: string; pages: number }[] } | { text: string },
) {
  const known = db.requirements
    .filter((entry) => entry.projectId === projectId)
    .map((entry) => entry.text);
  const { pending, result } = analyze(projectId, input, known);
  const files = 'files' in input ? input.files.map((file) => file.name) : [];
  const label = files.length > 1 ? `${files.length} files` : (files[0] ?? 'your requirements');
  const pages = 'files' in input ? input.files.reduce((sum, file) => sum + file.pages, 0) : 0;
  const issues = [
    result.ambiguous && `${result.ambiguous} ambiguous`,
    result.missingInformation && `${result.missingInformation} missing information`,
    result.contradictions && `${result.contradictions} possible contradictions`,
  ].filter(Boolean);
  const job = startJob(db, {
    projectId,
    kind: 'analysis',
    createdBy: personId,
    files,
    pending,
    result,
    instant: getFlags().instantJobs,
    steps: [
      {
        label: `Reading ${label}`,
        detail: 'text' in input ? `${lines(input.text).length} lines` : `${pages} pages`,
      },
      {
        label: 'Splitting it into requirements',
        detail: `${result.requirements} requirements found in ${result.sections} sections`,
      },
      { label: 'Checking each one', detail: issues.length ? issues.join(', ') : 'No issues found' },
      {
        label: 'Drafting suggested rewrites',
        detail: result.rewrites
          ? `${result.rewrites} suggestions, all saved as drafts`
          : 'No rewrites needed',
      },
    ],
  });
  return accepted({ jobId: job.id });
}

onJobDone('analysis', (db, job) => {
  const ids = db.requirements
    .filter((entry) => entry.projectId === job.projectId)
    .map((entry) => entry.id);
  const drafts = job.pending as RequirementRecord[];
  for (const draft of drafts) {
    draft.id = nextId('REQ', ids);
    draft.history = [event({ type: 'ai' }, 'drafted')];
    ids.push(draft.id);
    db.requirements.push(draft);
  }
  job.pending = [];
  const project = db.projects.find((entry) => entry.id === job.projectId);
  if (project?.stage === 'getting-started') project.stage = 'reviewing-requirements';
  const label =
    job.files.length > 1 ? `${job.files.length} files` : (job.files[0] ?? 'your requirements');
  const issues = drafts.reduce((sum, draft) => sum + draft.findings.length, 0);
  notify(db, {
    personId: job.createdBy,
    projectId: job.projectId,
    title: `AI analysis of ${label} is ready`,
    detail: `${drafts.length} requirements found. ${drafts.length} are waiting for your decision.`,
    actor: { type: 'ai' },
    target: { type: 'requirements', id: null },
  });
  addActivity(db, {
    projectId: job.projectId,
    actor: { type: 'ai' },
    type: 'ai',
    action: issues ? 'flagged' : 'analyzed',
    item: {
      type: 'file',
      id: job.files[0] ?? 'Typed requirements',
      title: job.files[0] ?? 'Typed requirements',
    },
    count: issues || null,
  });
});

export const requirementHandlers = [
  api.get(BASE, (context) => {
    const { me, projectId } = inProject(context, 'workspace');
    const query = context.url.searchParams;
    const status = query.get('status');
    const search = query.get('search')?.toLowerCase() ?? '';
    const assignee = query.get('assignee') === 'me' ? me.id : query.get('assignee');
    return {
      items: context.db.requirements
        .filter(
          (entry) =>
            entry.projectId === projectId &&
            (!status || entry.status === status) &&
            (!assignee || entry.assigneeId === assignee) &&
            (!search || `${entry.id} ${entry.title} ${entry.text}`.toLowerCase().includes(search)),
        )
        .map((entry) => summary(context.db, entry)),
    };
  }),

  api.post('/projects/:projectId/srs', async (context) => {
    const { me, projectId } = inProject(context, 'upload');
    const form = await context.request.formData();
    const files = form.getAll('files').filter((entry): entry is File => typeof entry !== 'string');
    if (!files.length) {
      throw fail(422, 'validation', 'Check the highlighted fields, then try again.', {
        files: 'Choose a file first, or type the requirements in.',
      });
    }
    for (const file of files) {
      const check = SrsFile.safeParse({ name: file.name, size: file.size });
      if (!check.success) {
        throw fail(422, 'validation', 'Check the highlighted fields, then try again.', {
          files: `${file.name}: ${check.error.issues[0]?.message ?? 'This file can’t be used.'}`,
        });
      }
    }
    analysisRunning(context.db, projectId);
    const uploaded = files.map((file) => ({
      name: file.name,
      pages: Math.max(1, Math.round(file.size / 70_000)),
    }));
    for (const [index, file] of files.entries()) {
      context.db.files.push({
        projectId,
        name: file.name,
        size: file.size,
        pages: uploaded[index]?.pages ?? null,
        uploadedAt: now(),
      });
      addActivity(context.db, {
        projectId,
        actor: by(me.id),
        type: 'srs',
        action: 'uploaded',
        item: { type: 'file', id: file.name, title: file.name },
      });
    }
    return startAnalysis(context.db, projectId, me.id, { files: uploaded });
  }),

  api.post(`${BASE}/typed`, async (context) => {
    const { me, projectId } = inProject(context, 'upload');
    const input = await body(context.request, TypedRequirementsInput);
    analysisRunning(context.db, projectId);
    return startAnalysis(context.db, projectId, me.id, { text: input.text });
  }),

  api.post(`${BASE}/approve-all`, (context) => {
    const { me, projectId } = inProject(context, 'approve');
    const ready = context.db.requirements.filter(
      (entry) =>
        entry.projectId === projectId &&
        entry.status === 'pending-review' &&
        entry.findings.every((finding) => finding.resolved),
    );
    for (const record of ready) decide(context.db, record, me.id, 'approved', null);
    return { approved: ready.map((record) => record.id) };
  }),

  api.get(`${BASE}/:requirementId`, (context) => {
    const { record } = load(context, 'workspace');
    return view(context.db, record);
  }),

  api.patch(`${BASE}/:requirementId`, async (context) => {
    const { me, record } = load(context, 'edit');
    const input = await body(context.request, RequirementInput);
    if (record.status === 'approved') {
      throw fail(
        409,
        'conflict',
        `${record.id} is approved. Return it to review before you edit it.`,
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

  api.post(`${BASE}/:requirementId/approve`, (context) => {
    const { me, record } = load(context, 'approve');
    if (record.status === 'approved') {
      throw fail(409, 'conflict', `${record.id} is already approved.`);
    }
    decide(context.db, record, me.id, 'approved', null);
    return view(context.db, record);
  }),

  api.post(`${BASE}/:requirementId/reject`, async (context) => {
    const { me, record } = load(context, 'approve');
    const { reason } = await body(context.request, ReasonInput);
    if (record.status === 'rejected') {
      throw fail(409, 'conflict', `${record.id} is already rejected.`);
    }
    if (builtOn(context.db, record)) {
      throw fail(
        409,
        'conflict',
        `Approved scenarios are built on ${record.id}, so it can’t be rejected now.`,
      );
    }
    decide(context.db, record, me.id, 'rejected', reason);
    return view(context.db, record);
  }),

  api.post(`${BASE}/:requirementId/return-to-review`, (context) => {
    const { me, record } = load(context, 'approve');
    if (record.status === 'pending-review') {
      throw fail(409, 'conflict', `${record.id} is already pending review.`);
    }
    if (builtOn(context.db, record)) {
      throw fail(
        409,
        'conflict',
        `Approved scenarios are built on ${record.id}, so it can’t go back to review.`,
      );
    }
    record.status = 'pending-review';
    record.rejectionReason = null;
    record.decidedBy = null;
    record.decidedAt = null;
    record.history.push(event(by(me.id), 'returned-to-review'));
    return view(context.db, record);
  }),

  api.patch(`${BASE}/:requirementId/priority`, async (context) => {
    const { me, record } = load(context, 'approve');
    const { priority } = await body(context.request, PriorityInput);
    record.priority = priority;
    record.history.push(event(by(me.id), 'priority-set', priority));
    return view(context.db, record);
  }),

  api.post(`${BASE}/:requirementId/accept-rewrite`, (context) => {
    const { me, record } = load(context, 'approve');
    if (!record.rewrite) {
      throw fail(409, 'conflict', `${record.id} has no suggested rewrite.`);
    }
    if (record.status === 'approved') {
      throw fail(
        409,
        'conflict',
        `${record.id} is approved, so the AI can’t change it. Return it to review first.`,
      );
    }
    record.text = record.rewrite;
    record.rewrite = null;
    record.findings = record.findings.map((finding) => ({ ...finding, resolved: true }));
    record.history.push(event(by(me.id), 'rewrite-accepted'));
    return view(context.db, record);
  }),

  api.post(`${BASE}/:requirementId/findings/:n/resolve`, (context) => {
    const { me, record } = load(context, 'approve');
    const n = Number(context.params.n);
    const finding = found(
      record.findings.find((entry) => entry.n === n),
      `Finding ${String(n)} on ${record.id}`,
    );
    finding.resolved = true;
    record.history.push(event(by(me.id), 'finding-resolved', `Finding ${String(n)}`));
    return view(context.db, record);
  }),
];
