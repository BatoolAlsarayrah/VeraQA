import { describe, expect, it } from 'vitest';

import { request } from '@/lib';
import { Dashboard } from '@/types';

import { getDb } from '../db';
import { mockServer } from '../server';

mockServer();

const ECOM = '/projects/e-commerce-portal-v2/dashboard';

describe('dashboard', () => {
  it('sums up every stage of the project', async () => {
    const dashboard = await request(ECOM, Dashboard);

    expect(dashboard.stages).toEqual({
      srs: { files: 2 },
      requirements: { total: 26, approved: 21, pending: 5 },
      scenarios: { total: 13, approved: 11, pending: 2 },
      testCases: { total: 35, approved: 34, pending: 1 },
      run: { number: 12, name: 'Sprint 4 regression', total: 34, ran: 22 },
      defects: { open: 7, critical: 1 },
    });
    expect(dashboard.run?.counts).toEqual({ passed: 18, failed: 3, blocked: 1, notRun: 12 });
    expect(dashboard.defects).toEqual({ critical: 1, high: 3, medium: 2, low: 1 });
    expect(dashboard.activity).toHaveLength(4);
    expect(dashboard.targetDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('lists what needs attention, with the defect behind each failed or blocked test', async () => {
    const { attention } = await request(ECOM, Dashboard);

    expect(
      attention.map((entry) => [
        entry.kind,
        entry.count ?? entry.item?.id,
        entry.defect?.id ?? null,
      ]),
    ).toEqual([
      ['review-requirements', 5, null],
      ['approve-scenarios', 2, null],
      ['approve-test-cases', 1, null],
      ['run-tests', 3, null],
      ['failed-test', 'TC-005', 'BUG-009'],
      ['failed-test', 'TC-031', 'BUG-007'],
      ['blocked-test', 'TC-040', 'BUG-003'],
      ['failed-test', 'TC-047', 'BUG-010'],
      ['retest', 'TC-002', 'BUG-005'],
      ['retest', 'TC-031', 'BUG-007'],
    ]);
  });

  it('leaves review counts out for someone who can’t approve', async () => {
    getDb().signedIn = 'batool-mahmoud';
    const { attention } = await request(ECOM, Dashboard);

    expect(attention.some((entry) => entry.kind === 'review-requirements')).toBe(false);
    expect(attention.find((entry) => entry.kind === 'run-tests')?.count).toBe(12);
  });

  it('isn’t open to a developer', async () => {
    await expect(request('/projects/payments-api/dashboard', Dashboard)).rejects.toMatchObject({
      status: 403,
    });
  });
});
