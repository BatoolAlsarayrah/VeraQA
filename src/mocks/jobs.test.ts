import { afterEach, describe, expect, it, vi } from 'vitest';

import { resetDb } from './db';
import { jobState, onJobDone, settleJobs, startJob } from './jobs';

const steps = [
  { label: 'Reading SRS_v2.pdf', detail: '22 pages, 4,870 words' },
  { label: 'Splitting it into requirements', detail: '26 requirements found in 3 sections' },
  { label: 'Checking each one', detail: '8 issues flagged' },
  { label: 'Drafting suggested rewrites', detail: '7 suggestions, all saved as drafts' },
];

afterEach(() => {
  vi.useRealTimers();
});

describe('mock jobs', () => {
  it('take 6 to 10 seconds and step through their named steps', () => {
    vi.useFakeTimers();
    const db = resetDb();
    const job = startJob(db, {
      projectId: 'p',
      kind: 'analysis',
      createdBy: 'x',
      steps,
      instant: false,
    });
    const start = Date.parse(job.startedAt);

    expect(job.duration).toBeGreaterThanOrEqual(6000);
    expect(job.duration).toBeLessThanOrEqual(10000);

    const early = jobState(job, start + job.duration * 0.3);
    expect(early.status).toBe('running');
    expect(early.step).toBe(1);
    expect(early.steps.map((step) => step.status)).toEqual([
      'done',
      'running',
      'waiting',
      'waiting',
    ]);
    expect(early.steps[0]?.detail).toBe('22 pages, 4,870 words');
    expect(early.steps[1]?.detail).toBeNull();

    const late = jobState(job, start + job.duration);
    expect(late.status).toBe('done');
    expect(late.progress).toBe(1);
    expect(late.steps.every((step) => step.status === 'done')).toBe(true);
  });

  it('finish straight away when instant', () => {
    const db = resetDb();
    const job = startJob(db, {
      projectId: 'p',
      kind: 'analysis',
      createdBy: 'x',
      steps,
      instant: true,
    });

    expect(jobState(job, Date.now()).status).toBe('done');
  });

  it('apply what a finished job produced exactly once', () => {
    const db = resetDb();
    const finish = vi.fn();
    onJobDone('scenario-generation', finish);
    startJob(db, {
      projectId: 'p',
      kind: 'scenario-generation',
      createdBy: 'x',
      steps,
      instant: true,
    });

    settleJobs(db, Date.now());
    settleJobs(db, Date.now());

    expect(finish).toHaveBeenCalledOnce();
  });

  it('never apply a cancelled job', () => {
    const db = resetDb();
    const finish = vi.fn();
    onJobDone('test-case-generation', finish);
    const job = startJob(db, {
      projectId: 'p',
      kind: 'test-case-generation',
      createdBy: 'x',
      steps,
      instant: true,
    });
    job.cancelled = true;

    settleJobs(db, Date.now());

    expect(finish).not.toHaveBeenCalled();
    expect(jobState(job, Date.now()).status).toBe('cancelled');
  });
});
