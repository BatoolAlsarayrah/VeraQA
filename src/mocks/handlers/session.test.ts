import { describe, expect, it } from 'vitest';

import { none, request } from '@/lib';
import { NotificationSettings, Session, User } from '@/types';

import { getDb } from '../db';
import { DEMO_PASSWORD } from '../seed';
import { mockServer } from '../server';

mockServer();

const post = (body: unknown) => ({ method: 'POST' as const, body, unauthorized: 'throw' as const });

describe('session', () => {
  it('returns the signed-in person with their capabilities per project', async () => {
    const session = await request('/session', Session);

    expect(session.user).toEqual({
      id: 'batool-hani',
      name: 'Batool Hani',
      email: 'batool.hani@shop-team.com',
    });
    expect(session.memberships.map((entry) => [entry.projectId, entry.role])).toEqual([
      ['e-commerce-portal-v2', 'qa-lead'],
      ['clinic-booking-app', 'qa-engineer'],
      ['payments-api', 'developer'],
      ['library-system', 'project-manager'],
    ]);
    expect(session.memberships.find((entry) => entry.role === 'developer')?.capabilities).toEqual([
      'fix',
    ]);
  });

  it('answers 401 when nobody is signed in', async () => {
    getDb().signedIn = null;

    await expect(request('/session', Session, { unauthorized: 'throw' })).rejects.toMatchObject({
      status: 401,
    });
  });
});

describe('sign-in and sign-out', () => {
  it('refuses wrong details with 422, not 401', async () => {
    await expect(
      request(
        '/auth/sign-in',
        Session,
        post({ email: 'qays.kaled@shop-team.com', password: 'nope' }),
      ),
    ).rejects.toMatchObject({ status: 422, code: 'invalid_credentials' });
  });

  it('signs in as another seeded person', async () => {
    await request(
      '/auth/sign-in',
      Session,
      post({ email: 'Qays.Kaled@shop-team.com', password: DEMO_PASSWORD }),
    );

    const session = await request('/session', Session);
    expect(session.user.name).toBe('Qays Kaled');
  });

  it('signs out', async () => {
    await request('/auth/sign-out', none, { method: 'POST' });

    await expect(request('/session', Session, { unauthorized: 'throw' })).rejects.toMatchObject({
      status: 401,
    });
  });
});

describe('register and forgot password', () => {
  it('creates an account with no projects and signs it in', async () => {
    const session = await request(
      '/auth/register',
      Session,
      post({ firstName: 'Omar', lastName: 'Saleh', email: 'omar@uni.edu', password: 'Testing#1' }),
    );

    expect(session.user).toMatchObject({ id: 'omar-saleh', name: 'Omar Saleh' });
    expect(session.memberships).toEqual([]);
  });

  it('refuses an email that already has an account', async () => {
    await expect(
      request(
        '/auth/register',
        Session,
        post({
          firstName: 'Lina',
          lastName: 'Saeed',
          email: 'lina.saeed@shop-team.com',
          password: 'Testing#1',
        }),
      ),
    ).rejects.toMatchObject({
      status: 422,
      fields: { email: 'An account with this email already exists. Sign in instead.' },
    });
  });

  it('accepts a reset request without saying whether the email exists', async () => {
    await expect(
      request('/auth/forgot-password', none, post({ email: 'nobody@nowhere.com' })),
    ).resolves.toBeUndefined();
  });
});

describe('account', () => {
  it('updates the profile, but not to someone else’s email', async () => {
    const updated = await request('/account/profile', User, {
      method: 'PATCH',
      body: { firstName: 'Batool', lastName: 'Hani', email: 'b.hani@shop-team.com' },
    });
    expect(updated.email).toBe('b.hani@shop-team.com');

    await expect(
      request('/account/profile', User, {
        method: 'PATCH',
        body: { firstName: 'Batool', lastName: 'Hani', email: 'qays.kaled@shop-team.com' },
      }),
    ).rejects.toMatchObject({ status: 422, fields: { email: expect.any(String) as string } });
  });

  it('changes the password only with the current one', async () => {
    await expect(
      request('/account/password', none, post({ current: 'wrong', next: 'Newpass#22' })),
    ).rejects.toMatchObject({ fields: { current: 'That isn’t your current password.' } });

    await request('/account/password', none, post({ current: DEMO_PASSWORD, next: 'Newpass#22' }));
    await request('/auth/sign-out', none, { method: 'POST' });

    await expect(
      request(
        '/auth/sign-in',
        Session,
        post({ email: 'batool.hani@shop-team.com', password: 'Newpass#22' }),
      ),
    ).resolves.toMatchObject({ user: { id: 'batool-hani' } });
  });

  it('keeps the email notification choices', async () => {
    const defaults = await request('/account/notification-settings', NotificationSettings);
    expect(defaults.email['defect-assigned']).toBe(true);

    const saved = await request('/account/notification-settings', NotificationSettings, {
      method: 'PUT',
      body: { email: { 'defect-assigned': false, 'run-started': true } },
    });

    expect(saved.email).toMatchObject({ 'defect-assigned': false, 'run-started': true });
  });
});
