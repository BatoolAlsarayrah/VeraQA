import type { JobKind, JobStatus, JobStep } from '@/types';

import type { Db, JobRecord } from './db';

type Finish = (db: Db, job: JobRecord) => void;

const finishers = new Map<JobKind, Finish>();

export function onJobDone(kind: JobKind, finish: Finish) {
  finishers.set(kind, finish);
}

type Start = {
  projectId: string;
  kind: JobKind;
  createdBy: string;
  steps: { label: string; detail: string | null }[];
  files?: string[];
  items?: string[];
  result?: JobRecord['result'];
  pending?: JobRecord['pending'];
  instant: boolean;
};

export function startJob(db: Db, start: Start): JobRecord {
  const job: JobRecord = {
    id: `job-${crypto.randomUUID()}`,
    projectId: start.projectId,
    kind: start.kind,
    createdBy: start.createdBy,
    startedAt: new Date().toISOString(),
    duration: start.instant ? 0 : 6000 + Math.round(Math.random() * 4000),
    steps: start.steps,
    files: start.files ?? [],
    items: start.items ?? [],
    cancelled: false,
    finished: false,
    result: start.result ?? null,
    pending: start.pending ?? [],
  };
  db.jobs.push(job);
  return job;
}

export function progressOf(job: JobRecord, now: number) {
  if (job.duration === 0) return 1;
  return Math.min(1, Math.max(0, (now - Date.parse(job.startedAt)) / job.duration));
}

export function jobState(job: JobRecord, now: number) {
  const progress = progressOf(job, now);
  const status: JobStatus = job.cancelled ? 'cancelled' : progress >= 1 ? 'done' : 'running';
  const count = job.steps.length;
  const step = status === 'done' ? count - 1 : Math.min(count - 1, Math.floor(progress * count));
  const steps: JobStep[] = job.steps.map((entry, index) => {
    const done = status === 'done' || index < step;
    return {
      label: entry.label,
      detail: done ? entry.detail : null,
      status: done ? 'done' : index === step && status === 'running' ? 'running' : 'waiting',
    };
  });
  const finishedAt =
    status === 'done' ? new Date(Date.parse(job.startedAt) + job.duration).toISOString() : null;
  return { status, step, steps, progress: status === 'done' ? 1 : progress, finishedAt };
}

export function settleJobs(db: Db, now: number) {
  for (const job of db.jobs) {
    if (job.finished || job.cancelled || progressOf(job, now) < 1) continue;
    job.finished = true;
    finishers.get(job.kind)?.(db, job);
  }
}
