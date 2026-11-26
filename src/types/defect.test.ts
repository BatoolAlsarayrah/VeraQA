import { describe, expect, it } from 'vitest';

import { Defect, RetestInput } from './defect';

const at = '2026-11-25T10:58:00.000Z';
const qays = { id: 'qays-kaled', name: 'Qays Kaled' };
const batool = { id: 'batool-mahmoud', name: 'Batool Mahmoud' };

const bug = {
  id: 'BUG-007',
  title: 'Account locks after 6 failed attempts instead of 5',
  severity: 'high',
  status: 'open',
  assignee: qays,
  reporter: batool,
  testCase: { id: 'TC-031', title: 'Lock the account after 5 consecutive failed logins' },
  reportedAt: at,
  updatedAt: at,
  steps: [
    'Open the sign-in page.',
    'Sign in with the wrong password 4 times.',
    'Sign in with the wrong password a 5th time.',
  ],
  expected: 'The account locks for 15 minutes.',
  actual: 'The account stays active. It locks only after the 6th attempt.',
  environment: 'Staging, Chrome 130',
  evidence: [{ id: 'ev-1', name: 'TC-031-step-3.png', size: 253952, type: 'image/png' }],
  source: {
    run: { number: 12, name: 'Sprint 4 regression' },
    testCase: { id: 'TC-031', title: 'Lock the account after 5 consecutive failed logins' },
    step: 3,
  },
  trace: {
    scenario: { id: 'SC-007', title: 'Lock on the 5th failed login in a row' },
    requirement: { id: 'REQ-014', title: 'Lock the account for 15 minutes after 5 failed logins' },
  },
  notes: [],
  retests: [],
  history: [{ at, actor: batool, action: 'reported', status: 'open', note: null }],
  waitingOn: qays,
};

describe('Defect', () => {
  it('parses the full report a QA lead sees', () => {
    expect(Defect.parse(bug).trace?.requirement.id).toBe('REQ-014');
  });

  it('parses the developer view, which has no trace back to the requirement', () => {
    expect(Defect.parse({ ...bug, trace: null }).trace).toBeNull();
  });

  it('refuses a status outside the lifecycle', () => {
    expect(Defect.safeParse({ ...bug, status: 'wont-fix' }).success).toBe(false);
  });
});

describe('RetestInput', () => {
  it('needs a note when the retest fails', () => {
    const result = RetestInput.safeParse({ outcome: 'failed', note: null });

    expect(result.error?.issues[0]?.message).toBe(
      'Say what still fails, so the developer can pick it up.',
    );
  });

  it('accepts a passed retest without a note', () => {
    expect(RetestInput.safeParse({ outcome: 'passed', note: null }).success).toBe(true);
  });
});
