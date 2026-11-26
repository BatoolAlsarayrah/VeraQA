import { describe, expect, it } from 'vitest';

import { ResultInput, RunEntry } from './run';

function messages(input: unknown) {
  const result = ResultInput.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

const env = 'Staging, Chrome 130';

describe('ResultInput', () => {
  it('accepts a passed test', () => {
    expect(
      messages({
        environment: env,
        steps: [
          { n: 1, result: 'passed', actual: null },
          { n: 2, result: 'passed', actual: null },
        ],
        blocked: null,
      }),
    ).toEqual([]);
  });

  it('asks what happened on a failed step', () => {
    expect(
      messages({
        environment: env,
        steps: [{ n: 3, result: 'failed', actual: null }],
        blocked: null,
      }),
    ).toEqual(['Say what happened instead.']);
  });

  it('asks why a step is blocked, and keeps the steps after it not run', () => {
    expect(
      messages({
        environment: env,
        steps: [
          { n: 1, result: 'passed', actual: null },
          { n: 2, result: 'blocked', actual: null },
          { n: 3, result: 'passed', actual: null },
        ],
        blocked: null,
      }),
    ).toEqual(['Say why the test is blocked.', 'Steps after a blocked step stay not run.']);
  });

  it('needs the blocking defect when the reason is a defect', () => {
    expect(
      messages({
        environment: env,
        steps: [
          { n: 1, result: 'blocked', actual: null },
          { n: 2, result: 'not-run', actual: null },
        ],
        blocked: { reason: 'blocked-by-defect', details: '', defectId: null },
      }),
    ).toEqual(['Choose the defect that blocks it, or report a new one.']);
  });

  it('accepts a test blocked by BUG-003', () => {
    expect(
      messages({
        environment: env,
        steps: [
          { n: 1, result: 'passed', actual: null },
          { n: 2, result: 'blocked', actual: null },
          { n: 3, result: 'not-run', actual: null },
        ],
        blocked: {
          reason: 'blocked-by-defect',
          details: 'Card payment fails for Visa numbers with spaces.',
          defectId: 'BUG-003',
        },
      }),
    ).toEqual([]);
  });
});

describe('RunEntry', () => {
  it('describes TC-040 blocked by BUG-003 in Run 12', () => {
    const entry = RunEntry.parse({
      testCase: { id: 'TC-040', title: 'Pay with a valid Visa card' },
      scenario: { id: 'SC-010', title: 'Pay for an order by credit card' },
      assignee: { id: 'batool-hani', name: 'Batool Hani' },
      result: 'blocked',
      blocked: {
        step: 2,
        reason: 'blocked-by-defect',
        details: 'Card payment fails for Visa numbers with spaces.',
        defect: {
          id: 'BUG-003',
          title: 'Card payment fails for Visa numbers with spaces',
          status: 'reopened',
        },
      },
      readyToRunAgain: false,
    });

    expect(entry.blocked?.defect?.id).toBe('BUG-003');
  });
});
