import { describe, expect, it } from 'vitest';

import { request } from '@/lib';
import { Job, JobStart, list, Scenario, TestCase, TestCaseSummary } from '@/types';

import { mockServer } from '../server';

mockServer();

const BASE = '/projects/e-commerce-portal-v2/test-cases';
const CLINIC = '/projects/clinic-booking-app/test-cases';
const post = (path: string, body?: unknown) =>
  request(`${BASE}/${path}`, TestCase, { method: 'POST', body });

describe('test case lists', () => {
  it('lists test cases with their last result', async () => {
    const all = await request(BASE, list(TestCaseSummary));
    const failed = await request(BASE, list(TestCaseSummary), { query: { result: 'failed' } });
    const blocked = await request(BASE, list(TestCaseSummary), { query: { result: 'blocked' } });

    expect(all.items).toHaveLength(35);
    expect(failed.items.map((entry) => entry.id)).toEqual(['TC-005', 'TC-031', 'TC-047', 'TC-052']);
    expect(blocked.items.map((entry) => entry.id)).toEqual(['TC-040']);
    expect(all.items.find((entry) => entry.id === 'TC-002')?.lastResult).toBe('passed');
  });

  it('refuses test cases to a developer', async () => {
    await expect(
      request('/projects/payments-api/test-cases', list(TestCaseSummary)),
    ).rejects.toMatchObject({ status: 403 });
  });
});

describe('test case detail', () => {
  it('follows the chain back to the requirement and lists every run and defect', async () => {
    const testCase = await request(`${BASE}/TC-031`, TestCase);

    expect(testCase.requirement.id).toBe('REQ-014');
    expect(testCase.scenario.id).toBe('SC-007');
    expect(testCase.steps).toHaveLength(4);
    expect(testCase.runs.map((run) => [run.number, run.result, run.failedStep])).toEqual([
      [13, 'not-run', null],
      [12, 'failed', 3],
      [11, 'passed', null],
      [10, 'passed', null],
      [9, 'passed', null],
    ]);
    expect(testCase.defects.map((defect) => [defect.id, defect.status])).toEqual([
      ['BUG-007', 'fixed'],
      ['BUG-011', 'invalid'],
    ]);
    expect(testCase.assignee?.name).toBe('Batool Mahmoud');
  });
});

describe('reviewing test cases', () => {
  it('approves a draft', async () => {
    await expect(post('TC-045/approve')).resolves.toMatchObject({ status: 'approved' });
  });

  it('won’t reject a test case that already has results', async () => {
    await expect(post('TC-031/reject', { reason: 'Duplicate.' })).rejects.toMatchObject({
      status: 409,
    });
  });

  it('lets a QA engineer edit a draft but not an approved test case', async () => {
    const body = {
      title: 'Send the reminder in Arabic',
      type: 'normal',
      precondition: null,
      testData: [],
      steps: [
        {
          action: 'Book as a patient whose language is Arabic.',
          expected: 'the SMS is in Arabic.',
        },
      ],
    };

    await expect(
      request(`${CLINIC}/TC-014`, TestCase, { method: 'PATCH', body }),
    ).resolves.toMatchObject({ title: 'Send the reminder in Arabic', steps: [{ n: 1 }] });
    await expect(
      request(`${CLINIC}/TC-001`, TestCase, { method: 'PATCH', body }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('needs at least one step', async () => {
    await expect(
      request(`${BASE}/TC-045`, TestCase, {
        method: 'PATCH',
        body: { title: 'x', type: 'normal', precondition: null, testData: [], steps: [] },
      }),
    ).rejects.toMatchObject({ status: 422, fields: { steps: 'Add at least one step.' } });
  });
});

describe('test case generation', () => {
  it('asks for test data first when a scenario needs it', async () => {
    const { jobId } = await request(`${BASE}/generate`, JobStart, { method: 'POST' });
    const job = await request(`/jobs/${jobId}`, Job);

    if (job.kind !== 'test-case-generation') throw new Error('Expected a test case generation job');
    expect(job.result).toMatchObject({ read: 1, covered: 0, drafted: 0 });
    expect(job.result?.needsTestData[0]).toMatchObject({
      scenario: { id: 'SC-002' },
      reason: expect.stringMatching(/Add it as test data, then generate again\.$/) as string,
    });
  });

  it('drafts test cases once the test data is there', async () => {
    await request('/projects/e-commerce-portal-v2/scenarios/SC-002', Scenario, {
      method: 'PATCH',
      body: {
        title: 'Refuse an email that is already registered',
        description: 'Registering again with an email that already has an account is refused.',
        precondition: 'An account is already registered with the email used.',
        type: 'negative',
        testData: [{ label: 'Registered email', value: 'taken@shop.com' }],
      },
    });
    const { jobId } = await request(`${BASE}/generate`, JobStart, { method: 'POST' });
    const job = await request(`/jobs/${jobId}`, Job);

    if (job.kind !== 'test-case-generation') throw new Error('Expected a test case generation job');
    expect(job.result?.groups[0]?.testCases.map((entry) => [entry.id, entry.type])).toEqual([
      ['TC-053', 'normal'],
      ['TC-054', 'wrong-input'],
    ]);
    const draft = await request(`${BASE}/TC-053`, TestCase);
    expect(draft).toMatchObject({
      status: 'pending-review',
      origin: 'ai',
      testData: [{ value: 'taken@shop.com' }],
      requirement: { id: 'REQ-011' },
    });
  });
});
