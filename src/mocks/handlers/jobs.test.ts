import { describe, expect, it } from 'vitest';

import { request } from '@/lib';
import { Job, JobStart, list, Requirement } from '@/types';

import { setFlags } from '../api';
import { getDb } from '../db';
import { mockServer } from '../server';

mockServer();

const ECOM = '/projects/e-commerce-portal-v2';

function typed(text: string) {
  return request(`${ECOM}/requirements/typed`, JobStart, { method: 'POST', body: { text } });
}

describe('analysis of typed requirements', () => {
  it('splits the lines into requirements, flags vague words and suggests a rewrite', async () => {
    const { jobId } = await typed(
      '1. The system shall export orders as CSV.\n2. The cart shall update quickly when a coupon is applied.',
    );
    const job = await request(`/jobs/${jobId}`, Job);

    expect(job).toMatchObject({ kind: 'analysis', status: 'done', files: [] });
    expect(job.kind === 'analysis' && job.result).toMatchObject({
      requirements: 2,
      ambiguous: 1,
      rewrites: 1,
    });

    const added = await request(`${ECOM}/requirements/REQ-028`, Requirement);
    expect(added).toMatchObject({
      title: 'Cart shall update quickly when a coupon is applied',
      status: 'pending-review',
      origin: 'ai',
      rewrite: { text: 'The cart shall update within 1 second when a coupon is applied.' },
    });
    expect(added.findings[0]?.kind).toBe('ambiguous');
    expect(getDb().notifications[0]).toMatchObject({
      personId: 'batool-hani',
      title: 'AI analysis of your requirements is ready',
    });
  });
});

describe('jobs', () => {
  it('runs through named steps, shows up as active, and can be cancelled', async () => {
    setFlags({ instantJobs: false });
    const { jobId } = await typed('The system shall export orders as CSV.');

    const running = await request(`/jobs/${jobId}`, Job);
    expect(running.status).toBe('running');
    expect(running.steps.map((step) => step.label)).toEqual([
      'Reading your requirements',
      'Splitting it into requirements',
      'Checking each one',
      'Drafting suggested rewrites',
    ]);
    expect(running.kind === 'analysis' && running.result).toBeNull();

    const active = await request(`${ECOM}/jobs`, list(Job), { query: { active: true } });
    expect(active.items.map((job) => job.id)).toEqual([jobId]);

    await expect(typed('Another line.')).rejects.toMatchObject({ status: 409 });

    const cancelled = await request(`/jobs/${jobId}/cancel`, Job, { method: 'POST' });
    expect(cancelled.status).toBe('cancelled');
    await expect(request(`${ECOM}/jobs`, list(Job), { query: { active: true } })).resolves.toEqual({
      items: [],
    });
  });

  it('lists past jobs, newest first', async () => {
    const { items } = await request(`${ECOM}/jobs`, list(Job));

    expect(items.map((job) => job.id)).toEqual([
      'job-ecom-analysis',
      'job-ecom-cases',
      'job-ecom-scenarios',
    ]);
    expect(items[2]).toMatchObject({
      kind: 'scenario-generation',
      status: 'done',
      result: { drafted: 13 },
    });
  });

  it('won’t cancel a finished job', async () => {
    await expect(
      request('/jobs/job-ecom-analysis/cancel', Job, { method: 'POST' }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('hides jobs from people outside the project and from developers', async () => {
    getDb().signedIn = 'qays-kaled';

    await expect(request('/jobs/job-ecom-analysis', Job)).rejects.toMatchObject({ status: 404 });
    await expect(request('/jobs/job-lib-scenarios', Job)).rejects.toMatchObject({ status: 404 });
  });
});
