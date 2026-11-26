import { describe, expect, it } from 'vitest';

import { request } from '@/lib';
import { Defect, DefectSummary, list, Run } from '@/types';

import { getDb } from '../db';
import { mockServer } from '../server';

mockServer();

const ECOM = '/projects/e-commerce-portal-v2/defects';
const PAY = '/projects/payments-api/defects';

function act(base: string, id: string, action: string, body?: unknown) {
  return request(`${base}/${id}/${action}`, Defect, { method: 'POST', body });
}

function as(personId: string) {
  getDb().signedIn = personId;
}

describe('defect lists', () => {
  it('lists every defect for people with the workspace, with filters', async () => {
    const all = await request(ECOM, list(DefectSummary));
    const fixed = await request(ECOM, list(DefectSummary), { query: { status: 'fixed' } });
    const critical = await request(ECOM, list(DefectSummary), { query: { severity: 'critical' } });

    expect(all.items).toHaveLength(12);
    expect(fixed.items.map((entry) => entry.id)).toEqual(['BUG-005', 'BUG-007']);
    expect(critical.items.map((entry) => entry.id)).toEqual(['BUG-003']);
  });

  it('shows a developer only the defects assigned to them', async () => {
    const mine = await request(PAY, list(DefectSummary));

    expect(mine.items.map((entry) => entry.id)).toEqual([
      'BUG-001',
      'BUG-003',
      'BUG-005',
      'BUG-006',
    ]);
    await expect(request(`${PAY}/BUG-004`, Defect)).rejects.toMatchObject({ status: 404 });
  });
});

describe('defect detail', () => {
  it('shows the full report with the trace back to the requirement', async () => {
    const defect = await request(`${ECOM}/BUG-007`, Defect);

    expect(defect).toMatchObject({
      status: 'fixed',
      source: { run: { number: 12 }, testCase: { id: 'TC-031' }, step: 3 },
      trace: { scenario: { id: 'SC-007' }, requirement: { id: 'REQ-014' } },
      waitingOn: { name: 'Batool Mahmoud' },
      notes: [{ kind: 'fix', author: { name: 'Qays Kaled' } }],
    });
  });

  it('leaves the trace out for a developer, but keeps the test case', async () => {
    const defect = await request(`${PAY}/BUG-003`, Defect);

    expect(defect.trace).toBeNull();
    expect(defect.source?.testCase.id).toBe('TC-006');
    expect(defect.retests).toMatchObject([{ n: 1, outcome: 'failed' }]);
  });
});

describe('reporting a defect', () => {
  it('reports from a failed test, copying its evidence, and tells the developer', async () => {
    const defect = await request(ECOM, Defect, {
      method: 'POST',
      body: {
        title: 'Lock lasts 10 minutes instead of 15',
        severity: 'medium',
        assigneeId: 'lina-saeed',
        steps: ['Lock the account.', 'Wait 10 minutes.'],
        expected: 'Sign-in is still refused.',
        actual: 'Sign-in works.',
        environment: 'Staging, Chrome 130',
        source: { run: 12, testCaseId: 'TC-031', step: 3 },
      },
    });

    expect(defect).toMatchObject({
      id: 'BUG-013',
      status: 'open',
      reporter: { name: 'Batool Hani' },
    });
    expect(defect.evidence).toHaveLength(1);
    expect(getDb().notifications[0]).toMatchObject({
      personId: 'lina-saeed',
      title: 'Batool Hani assigned you BUG-013',
    });
  });

  it('needs a developer to assign it to', async () => {
    await expect(
      request(ECOM, Defect, {
        method: 'POST',
        body: {
          title: 'x',
          severity: 'low',
          assigneeId: 'batool-mahmoud',
          steps: ['x'],
          expected: 'x',
          actual: 'y',
          environment: 'Staging, Chrome 130',
          source: null,
        },
      }),
    ).rejects.toMatchObject({
      status: 422,
      fields: { assigneeId: 'Choose a developer in this project.' },
    });
  });
});

describe('defect lifecycle', () => {
  it('goes from Open to Fixed to Retest, and back to Reopened when the retest fails', async () => {
    as('lina-saeed');
    await expect(act(ECOM, 'BUG-012', 'start-fixing')).resolves.toMatchObject({
      status: 'in-progress',
    });
    await expect(act(ECOM, 'BUG-012', 'mark-fixed', { note: '' })).rejects.toMatchObject({
      fields: { note: 'Write a note before you continue.' },
    });
    await expect(
      act(ECOM, 'BUG-012', 'mark-fixed', { note: 'Check the end date before applying a code.' }),
    ).resolves.toMatchObject({ status: 'fixed', waitingOn: { name: 'Batool Mahmoud' } });

    as('batool-hani');
    await expect(act(ECOM, 'BUG-012', 'start-retest')).resolves.toMatchObject({
      status: 'retest',
      waitingOn: { name: 'Batool Hani' },
    });
    await expect(
      act(ECOM, 'BUG-012', 'retest', { outcome: 'failed', note: null }),
    ).rejects.toMatchObject({
      status: 422,
    });
    const reopened = await act(ECOM, 'BUG-012', 'retest', {
      outcome: 'failed',
      note: 'Codes that ended today are still accepted.',
    });

    expect(reopened).toMatchObject({ status: 'reopened', retests: [{ n: 1, outcome: 'failed' }] });
    expect(reopened.notes).toMatchObject([
      { kind: 'fix', text: 'Check the end date before applying a code.' },
    ]);
  });

  it('lets only the assigned developer work on a defect', async () => {
    as('maria-ayman');
    await expect(act(ECOM, 'BUG-012', 'start-fixing')).rejects.toMatchObject({
      status: 403,
      message: 'BUG-012 is assigned to Lina Saeed, so only Lina Saeed can do that.',
    });

    as('qays-kaled');
    await expect(act(ECOM, 'BUG-012', 'start-fixing')).rejects.toMatchObject({ status: 404 });
  });

  it('refuses actions that don’t fit the current status', async () => {
    as('qays-kaled');

    await expect(
      act(ECOM, 'BUG-007', 'mark-invalid', { reason: 'Works as designed.' }),
    ).rejects.toMatchObject({
      status: 409,
      message: 'BUG-007 is Fixed, so it can’t be marked as invalid now.',
    });
  });

  it('marks a defect invalid with a reason, which the reporter can reopen', async () => {
    as('lina-saeed');
    await expect(
      act(ECOM, 'BUG-010', 'mark-invalid', {
        reason: 'The cart updates after 1 second, as specified.',
      }),
    ).resolves.toMatchObject({ status: 'invalid', notes: [{ kind: 'invalid' }] });

    as('batool-hani');
    await expect(
      act(ECOM, 'BUG-010', 'reopen', { note: 'It doesn’t update at all until a reload.' }),
    ).resolves.toMatchObject({ status: 'reopened' });
  });

  it('frees the tests a defect blocked once its retest passes', async () => {
    as('qays-kaled');
    await act(ECOM, 'BUG-003', 'start-fixing');
    await act(ECOM, 'BUG-003', 'mark-fixed', { note: 'Pasted numbers are cleaned too now.' });
    as('batool-mahmoud');
    await act(ECOM, 'BUG-003', 'start-retest');
    const closed = await act(ECOM, 'BUG-003', 'retest', { outcome: 'passed', note: null });

    expect(closed).toMatchObject({ status: 'closed', waitingOn: null });
    as('batool-hani');
    const run = await request('/projects/e-commerce-portal-v2/runs/12', Run);
    expect(run.entries.find((entry) => entry.testCase.id === 'TC-040')).toMatchObject({
      result: 'blocked',
      readyToRunAgain: true,
    });
    expect(getDb().notifications.find((note) => note.personId === 'batool-hani')?.title).toBe(
      'BUG-003 is closed. TC-040 can be run again.',
    );
  });

  it('lets a solo project manager fix and retest their own defect', async () => {
    const LIB = '/projects/library-system/defects';

    await expect(act(LIB, 'BUG-003', 'start-fixing')).resolves.toMatchObject({
      status: 'in-progress',
    });
    await act(LIB, 'BUG-003', 'mark-fixed', { note: 'Count loans due today as still out.' });
    await act(LIB, 'BUG-003', 'start-retest');
    await expect(
      act(LIB, 'BUG-003', 'retest', { outcome: 'passed', note: null }),
    ).resolves.toMatchObject({
      status: 'closed',
    });
  });

  it('reassigns a defect to another developer, for people who manage', async () => {
    await expect(
      act(ECOM, 'BUG-012', 'assign', { assigneeId: 'qays-kaled' }),
    ).resolves.toMatchObject({
      assignee: { name: 'Qays Kaled' },
    });
    await expect(
      act(ECOM, 'BUG-012', 'assign', { assigneeId: 'batool-mahmoud' }),
    ).rejects.toMatchObject({
      status: 422,
    });
    as('batool-mahmoud');
    await expect(
      act(ECOM, 'BUG-012', 'assign', { assigneeId: 'lina-saeed' }),
    ).rejects.toMatchObject({
      status: 403,
    });
  });
});
