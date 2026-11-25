import { describe, expect, it } from 'vitest';

import { InviteInput } from './member';
import { ProjectInput } from './project';
import { PasswordInput, RegisterInput, Session } from './session';

describe('Session', () => {
  it('carries the user and the capabilities per project, without a current project', () => {
    const session = Session.parse({
      user: { id: 'batool-hani', name: 'Batool Hani', email: 'batool.hani@shop-team.com' },
      memberships: [
        {
          projectId: 'payments-api',
          projectName: 'Payments API',
          role: 'developer',
          capabilities: ['fix'],
          currentProjectId: 'ignored',
        },
      ],
    });

    expect(session.memberships[0]).not.toHaveProperty('currentProjectId');
  });

  it('refuses an unknown capability', () => {
    const result = Session.safeParse({
      user: { id: 'u', name: 'U', email: 'u@x.com' },
      memberships: [{ projectId: 'p', projectName: 'P', role: 'developer', capabilities: ['god'] }],
    });

    expect(result.success).toBe(false);
  });
});

describe('form inputs', () => {
  it('ask for a password of at least 8 characters with a number', () => {
    const base = { firstName: 'Lina', lastName: 'Saeed', email: 'lina.saeed@shop-team.com' };
    const short = RegisterInput.safeParse({ ...base, password: 'abc1' });
    const noNumber = RegisterInput.safeParse({ ...base, password: 'abcdefgh' });

    expect(short.error?.issues[0]?.message).toBe('Use at least 8 characters.');
    expect(noNumber.error?.issues[0]?.message).toBe('Add at least one number.');
    expect(PasswordInput.safeParse({ current: 'x', next: 'Correct#456' }).success).toBe(true);
  });

  it('need a project name', () => {
    const result = ProjectInput.safeParse({ name: ' ', description: '', team: 'solo' });

    expect(result.error?.issues[0]?.message).toBe('Give the project a name.');
  });

  it('never invite someone as project manager', () => {
    expect(
      InviteInput.safeParse({ emails: ['maria.ayman@shop-team.com'], role: 'project-manager' })
        .success,
    ).toBe(false);
    expect(
      InviteInput.safeParse({ emails: ['maria.ayman@shop-team.com'], role: 'qa-engineer' }).success,
    ).toBe(true);
  });
});
