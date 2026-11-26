import { describe, expect, it } from 'vitest';

import { request } from '@/lib';
import { list, Run, RunSummary, RunTest } from '@/types';

import { getDb } from '../db';
import { mockServer } from '../server';

mockServer();

const BASE = '/projects/e-commerce-portal-v2/runs';

const passedSteps = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ n: index + 1, result: 'passed', actual: null }));

function record(run: number, testCaseId: string, body: unknown) {
  return request(`${BASE}/${String(run)}/tests/${testCaseId}/result`, RunTest, {
    method: 'PUT',
    body,
  });
}

describe('runs', () => {
  it('lists runs, newest first, with their result counts', async () => {
    const { items } = await request(BASE, list(RunSummary));

    expect(items.map((run) => run.number)).toEqual([13, 12, 11, 10, 9]);
    expect(items[1]).toMatchObject({
      name: 'Sprint 4 regression',
      status: 'active',
      counts: { passed: 18, failed: 3, blocked: 1, notRun: 12 },
    });
  });

  it('shows each test in a run, with what blocks it', async () => {
    const run = await request(`${BASE}/12`, Run);
    const blocked = run.entries.find((entry) => entry.testCase.id === 'TC-040');

    expect(run.entries).toHaveLength(34);
    expect(blocked).toMatchObject({
      result: 'blocked',
      assignee: { name: 'Batool Hani' },
      blocked: { reason: 'blocked-by-defect', defect: { id: 'BUG-003', status: 'reopened' } },
      readyToRunAgain: false,
    });
  });

  it('starts a run of approved test cases, assigned to people who can test', async () => {
    const body = (testCaseId: string, assigneeId: string) => ({
      name: 'Sprint 5 regression',
      environment: 'Staging, Chrome 130',
      entries: [{ testCaseId, assigneeId }],
    });

    await expect(
      request(BASE, Run, { method: 'POST', body: body('TC-045', 'batool-mahmoud') }),
    ).rejects.toMatchObject({
      status: 422,
      fields: { 'entries.0.testCaseId': 'TC-045 isn’t approved, so it can’t be run yet.' },
    });
    await expect(
      request(BASE, Run, { method: 'POST', body: body('TC-031', 'qays-kaled') }),
    ).rejects.toMatchObject({ status: 422 });

    const run = await request(BASE, Run, {
      method: 'POST',
      body: body('TC-031', 'batool-mahmoud'),
    });
    expect(run).toMatchObject({ number: 14, status: 'active', counts: { notRun: 1 } });
    expect(getDb().notifications[0]).toMatchObject({
      personId: 'batool-mahmoud',
      title: 'Batool Hani assigned you 1 test case',
    });
  });

  it('only lets people who manage start, close or reassign a run', async () => {
    await expect(
      request('/projects/clinic-booking-app/runs', Run, {
        method: 'POST',
        body: {
          name: 'x',
          environment: 'Staging, Chrome 130',
          entries: [{ testCaseId: 'TC-001', assigneeId: null }],
        },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('closes a run, after which nothing more can be recorded', async () => {
    await expect(
      request(`${BASE}/13`, Run, { method: 'PATCH', body: { status: 'closed' } }),
    ).resolves.toMatchObject({ status: 'closed' });
    await expect(
      record(13, 'TC-031', {
        environment: 'Staging, Chrome 130',
        steps: passedSteps(4),
        blocked: null,
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('reassigns a test in a run', async () => {
    const run = await request(`${BASE}/12/entries/TC-033`, Run, {
      method: 'PATCH',
      body: { assigneeId: 'batool-hani' },
    });

    expect(run.entries.find((entry) => entry.testCase.id === 'TC-033')?.assignee?.name).toBe(
      'Batool Hani',
    );
  });
});

describe('running a test', () => {
  it('shows the steps, test data, chain and any defect reported from it', async () => {
    const test = await request(`${BASE}/12/tests/TC-031`, RunTest);

    expect(test).toMatchObject({
      run: { number: 12, name: 'Sprint 4 regression' },
      requirement: { id: 'REQ-014' },
      result: 'failed',
      defect: { id: 'BUG-007' },
      environments: ['Staging, Chrome 130', 'Staging, Firefox 132'],
    });
    expect(test.testCase.steps).toHaveLength(4);
    expect(test.steps[2]).toMatchObject({ result: 'failed' });
  });

  it('isn’t open to a developer', async () => {
    getDb().signedIn = 'qays-kaled';

    await expect(request(`${BASE}/12/tests/TC-031`, RunTest)).rejects.toMatchObject({
      status: 403,
    });
  });

  it('records a passed test', async () => {
    const test = await record(12, 'TC-032', {
      environment: 'Staging, Firefox 132',
      steps: passedSteps(4),
      blocked: null,
    });

    expect(test).toMatchObject({
      result: 'passed',
      environment: 'Staging, Firefox 132',
      recordedBy: { name: 'Batool Hani' },
    });
    expect(getDb().activity[0]).toMatchObject({ action: 'passed', item: { id: 'TC-032' } });
  });

  it('needs a result for every step, and a finished test', async () => {
    await expect(
      record(12, 'TC-032', {
        environment: 'Staging, Chrome 130',
        steps: passedSteps(2),
        blocked: null,
      }),
    ).rejects.toMatchObject({ fields: { steps: 'Record a result for every step.' } });
    await expect(
      record(12, 'TC-032', {
        environment: 'Staging, Chrome 130',
        steps: [
          ...passedSteps(2),
          { n: 3, result: 'not-run', actual: null },
          { n: 4, result: 'not-run', actual: null },
        ],
        blocked: null,
      }),
    ).rejects.toMatchObject({
      fields: { steps: 'Finish every step, or mark the step that failed or is blocked.' },
    });
  });

  it('records a blocked test with its reason and blocking defect', async () => {
    const steps = [
      { n: 1, result: 'passed', actual: null },
      { n: 2, result: 'blocked', actual: null },
      { n: 3, result: 'not-run', actual: null },
      { n: 4, result: 'not-run', actual: null },
    ];
    const test = await record(12, 'TC-032', {
      environment: 'Staging, Chrome 130',
      steps,
      blocked: { reason: 'blocked-by-defect', details: 'Sign-in is down.', defectId: 'BUG-007' },
    });

    expect(test).toMatchObject({
      result: 'blocked',
      blocked: { step: 2, reason: 'blocked-by-defect', defect: { id: 'BUG-007' } },
    });
  });

  it('won’t let a closed defect block a test', async () => {
    await expect(
      record(12, 'TC-032', {
        environment: 'Staging, Chrome 130',
        steps: [
          { n: 1, result: 'blocked', actual: null },
          { n: 2, result: 'not-run', actual: null },
          { n: 3, result: 'not-run', actual: null },
          { n: 4, result: 'not-run', actual: null },
        ],
        blocked: { reason: 'blocked-by-defect', details: '', defectId: 'BUG-001' },
      }),
    ).rejects.toMatchObject({
      status: 422,
      fields: { 'blocked.defectId': expect.stringMatching(/is closed/) as string },
    });
  });
});
