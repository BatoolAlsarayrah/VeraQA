import { describe, expect, it } from 'vitest';

import { request } from '@/lib';
import { Trace } from '@/types';

import { getDb } from '../db';
import { mockServer } from '../server';

mockServer();

const ECOM = '/projects/e-commerce-portal-v2/traceability';

describe('traceability', () => {
  it('follows each approved requirement down to its defects', async () => {
    const trace = await request(ECOM, Trace);
    const lock = trace.requirements.find((entry) => entry.id === 'REQ-014');

    expect(trace.requirements).toHaveLength(21);
    expect(lock?.scenarios.map((entry) => entry.id)).toEqual(['SC-007', 'SC-008', 'SC-009']);
    expect(lock?.scenarios[0]?.testCases[0]).toMatchObject({
      id: 'TC-031',
      lastResult: 'failed',
      defects: [{ id: 'BUG-007' }, { id: 'BUG-011' }],
    });
  });

  it('lists the coverage gaps', async () => {
    const { gaps } = await request(ECOM, Trace);

    expect(
      gaps.failedOrBlocked.map((entry) => [entry.id, entry.result, entry.blockedBy?.id ?? null]),
    ).toEqual([
      ['TC-005', 'failed', null],
      ['TC-031', 'failed', null],
      ['TC-040', 'blocked', 'BUG-003'],
      ['TC-047', 'failed', null],
      ['TC-052', 'failed', null],
    ]);
    expect(gaps.scenariosWithoutTests.map((entry) => entry.id)).toEqual(['SC-002']);
    expect(gaps.notRun.map((entry) => entry.id)).toEqual(
      expect.arrayContaining(['TC-046', 'TC-049', 'TC-051']),
    );
    expect(gaps.pendingRequirements).toBe(5);
  });

  it('is open to a QA engineer, but not to a developer', async () => {
    getDb().signedIn = 'batool-mahmoud';
    await expect(request(ECOM, Trace)).resolves.toHaveProperty('requirements');

    getDb().signedIn = 'qays-kaled';
    await expect(request(ECOM, Trace)).rejects.toMatchObject({ status: 403 });
  });
});
