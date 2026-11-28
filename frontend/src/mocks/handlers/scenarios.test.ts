import { describe, expect, it } from 'vitest';

import { request } from '@/lib';
import { Job, JobStart, list, Scenario, ScenarioSummary } from '@/types';

import { setFlags } from '../api';
import { getDb } from '../db';
import { mockServer } from '../server';

mockServer();

const BASE = '/projects/e-commerce-portal-v2/scenarios';
const CLINIC = '/projects/clinic-booking-app/scenarios';
const post = (path: string, body?: unknown) =>
  request(`${BASE}/${path}`, Scenario, { method: 'POST', body });

describe('scenario lists', () => {
  it('lists scenarios with their requirement and test cases', async () => {
    const all = await request(BASE, list(ScenarioSummary));
    const lock = await request(BASE, list(ScenarioSummary), { query: { requirement: 'REQ-014' } });
    const pending = await request(BASE, list(ScenarioSummary), {
      query: { status: 'pending-review' },
    });

    expect(all.items).toHaveLength(13);
    expect(lock.items.map((entry) => entry.id)).toEqual(['SC-007', 'SC-008', 'SC-009']);
    expect(pending.items.map((entry) => entry.id)).toEqual(['SC-004', 'SC-009']);
    expect(lock.items[0]?.testCases.map((entry) => [entry.id, entry.lastResult])).toEqual([
      ['TC-031', 'failed'],
      ['TC-032', 'passed'],
      ['TC-034', 'passed'],
    ]);
  });

  it('shows the test data and where the scenario came from', async () => {
    const scenario = await request(`${BASE}/SC-007`, Scenario);

    expect(scenario.requirement).toEqual({
      id: 'REQ-014',
      title: 'Lock the account for 15 minutes after 5 failed logins',
    });
    expect(scenario.testData).toHaveLength(3);
    expect(scenario.origin).toBe('ai');
  });

  it('refuses scenarios to a developer', async () => {
    await expect(
      request('/projects/payments-api/scenarios', list(ScenarioSummary)),
    ).rejects.toMatchObject({ status: 403 });
  });
});

describe('reviewing scenarios', () => {
  it('approves, and needs a reason to reject', async () => {
    await expect(post('SC-009/approve')).resolves.toMatchObject({ status: 'approved' });
    await expect(post('SC-004/reject', { reason: '' })).rejects.toMatchObject({ status: 422 });
    await expect(
      post('SC-004/reject', { reason: 'The sign-in page already offers this.' }),
    ).resolves.toMatchObject({ status: 'rejected' });
  });

  it('won’t reject a scenario that approved test cases are built on', async () => {
    await expect(post('SC-007/reject', { reason: 'Covered elsewhere.' })).rejects.toMatchObject({
      status: 409,
    });
  });

  it('lets a QA engineer edit a draft, but not an approved scenario', async () => {
    getDb().signedIn = 'batool-hani';
    const body = {
      title: 'Move an appointment to a free slot',
      description: 'A patient moves an appointment to another free slot with the same doctor.',
      precondition: 'The patient has an appointment in 3 days.',
      type: 'positive',
      testData: [],
    };

    await expect(
      request(`${CLINIC}/SC-006`, Scenario, { method: 'PATCH', body }),
    ).resolves.toMatchObject({ title: 'Move an appointment to a free slot' });
    await expect(
      request(`${CLINIC}/SC-001`, Scenario, { method: 'PATCH', body }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('lets a QA lead add test data to an approved scenario, which stays approved', async () => {
    const scenario = await request(`${BASE}/SC-002`, Scenario, {
      method: 'PATCH',
      body: {
        title: 'Refuse an email that is already registered',
        description: 'Registering again with an email that already has an account is refused.',
        precondition: 'An account is already registered with the email used.',
        type: 'negative',
        testData: [{ label: 'Registered email', value: 'taken@shop.com' }],
      },
    });

    expect(scenario).toMatchObject({ status: 'approved', testData: [{ value: 'taken@shop.com' }] });
  });
});

describe('scenario generation', () => {
  it('drafts scenarios for approved requirements that have none, and names the vague ones', async () => {
    const { jobId } = await request(`${BASE}/generate`, JobStart, { method: 'POST' });
    const job = await request(`/jobs/${jobId}`, Job);

    if (job.kind !== 'scenario-generation') throw new Error('Expected a scenario generation job');
    expect(job.status).toBe('done');
    expect(job.result).toMatchObject({ read: 14, covered: 12, drafted: 23 });
    expect(job.result?.tooVague.map((entry) => entry.requirement.id)).toEqual([
      'REQ-021',
      'REQ-022',
    ]);
    expect(job.items.find((item) => item.id === 'REQ-001')).toMatchObject({
      progress: 'done',
      drafted: 2,
    });

    const drafts = await request(BASE, list(ScenarioSummary), {
      query: { requirement: 'REQ-001' },
    });
    expect(drafts.items).toMatchObject([
      { id: 'SC-014', status: 'pending-review', origin: 'ai', type: 'positive' },
      { id: 'SC-015', type: 'negative' },
    ]);
    expect(getDb().notifications[0]?.title).toBe('23 scenario drafts are ready for review');
  });

  it('runs one generation at a time', async () => {
    setFlags({ instantJobs: false });
    await request(`${BASE}/generate`, JobStart, { method: 'POST' });

    await expect(request(`${BASE}/generate`, JobStart, { method: 'POST' })).rejects.toMatchObject({
      status: 409,
    });
  });

  it('is only for people who can approve', async () => {
    await expect(request(`${CLINIC}/generate`, JobStart, { method: 'POST' })).rejects.toMatchObject(
      { status: 403 },
    );
  });
});
