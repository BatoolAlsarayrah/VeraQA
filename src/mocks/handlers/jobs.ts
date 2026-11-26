import type { Job } from '@/types';

import { api, fail } from '../api';
import type { Db, JobRecord } from '../db';
import { jobState } from '../jobs';
import { can, found, inProject, membership, signedIn } from '../rules';

function itemProgress(index: number, count: number, status: string, progress: number) {
  if (status === 'done') return 'done' as const;
  const reached = Math.floor(progress * count);
  if (index < reached) return 'done' as const;
  return index === reached && status === 'running' ? ('running' as const) : ('waiting' as const);
}

function draftedFor(job: JobRecord, id: string) {
  const result = job.result;
  if (result && 'tooVague' in result) {
    return result.groups.find((group) => group.requirement.id === id)?.scenarios.length ?? 0;
  }
  if (result && 'needsTestData' in result) {
    return result.groups.find((group) => group.scenario.id === id)?.testCases.length ?? 0;
  }
  return 0;
}

export function jobView(db: Db, job: JobRecord, now = Date.now()): Job {
  const state = jobState(job, now);
  const base = {
    id: job.id,
    projectId: job.projectId,
    status: state.status,
    step: state.step,
    steps: state.steps,
    progress: state.progress,
    startedAt: job.startedAt,
    finishedAt: state.finishedAt,
    error: null,
  };
  const done = state.status === 'done';

  if (job.kind === 'analysis') {
    return {
      ...base,
      kind: 'analysis',
      files: job.files,
      result: done && job.result && 'requirements' in job.result ? job.result : null,
    };
  }

  const drafted = (id: string) => draftedFor(job, id);

  if (job.kind === 'scenario-generation') {
    return {
      ...base,
      kind: 'scenario-generation',
      items: job.items.map((id, index) => {
        const progress = itemProgress(index, job.items.length, state.status, state.progress);
        const title =
          db.requirements.find((entry) => entry.projectId === job.projectId && entry.id === id)
            ?.title ?? id;
        return { id, title, progress, drafted: progress === 'done' ? drafted(id) : 0 };
      }),
      result: done && job.result && 'tooVague' in job.result ? job.result : null,
    };
  }

  return {
    ...base,
    kind: 'test-case-generation',
    items: job.items.map((id, index) => {
      const progress = itemProgress(index, job.items.length, state.status, state.progress);
      const title =
        db.scenarios.find((entry) => entry.projectId === job.projectId && entry.id === id)?.title ??
        id;
      return { id, title, progress, drafted: progress === 'done' ? drafted(id) : 0 };
    }),
    result: done && job.result && 'needsTestData' in job.result ? job.result : null,
  };
}

function visibleJob(db: Db, id: string) {
  const me = signedIn(db);
  const job = found(
    db.jobs.find((entry) => entry.id === id),
    'That job',
  );
  const member = membership(db, me.id, job.projectId);
  if (!can(member, 'workspace')) throw fail(404, 'not_found', 'That job doesn’t exist.');
  return { me, member, job };
}

export const jobHandlers = [
  api.get('/jobs/:jobId', ({ db, params }) => jobView(db, visibleJob(db, params.jobId ?? '').job)),

  api.get('/projects/:projectId/jobs', (context) => {
    const { projectId } = inProject(context, 'workspace');
    const active = context.url.searchParams.get('active') === 'true';
    const now = Date.now();
    return {
      items: context.db.jobs
        .filter((job) => job.projectId === projectId)
        .map((job) => jobView(context.db, job, now))
        .filter((job) => !active || job.status === 'queued' || job.status === 'running')
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    };
  }),

  api.post('/jobs/:jobId/cancel', ({ db, params }) => {
    const { me, member, job } = visibleJob(db, params.jobId ?? '');
    const kindCap = job.kind === 'analysis' ? 'upload' : 'approve';
    if (job.createdBy !== me.id && !can(member, kindCap)) {
      throw fail(
        403,
        'forbidden',
        'Only the person who started it, or someone who can start it, can cancel it.',
      );
    }
    const status = jobState(job, Date.now()).status;
    if (status === 'done' || job.finished) {
      throw fail(409, 'conflict', 'It already finished, so there’s nothing to cancel.');
    }
    job.cancelled = true;
    return jobView(db, job);
  }),
];
