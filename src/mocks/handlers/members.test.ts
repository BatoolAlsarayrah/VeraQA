import { describe, expect, it } from 'vitest';

import { none, request } from '@/lib';
import { list, Member } from '@/types';

import { getDb } from '../db';
import { mockServer } from '../server';

mockServer();

const ECOM = '/projects/e-commerce-portal-v2/members';

describe('members', () => {
  it('shows people who manage everyone’s email and workload', async () => {
    const { items } = await request(ECOM, list(Member));
    const batool = items.find((member) => member.id === 'batool-hani');
    const qays = items.find((member) => member.id === 'qays-kaled');

    expect(items).toHaveLength(5);
    expect(batool).toMatchObject({
      email: 'batool.hani@shop-team.com',
      status: 'active',
      workload: { assigned: 19, done: 11, unit: 'items' },
    });
    expect(qays?.workload).toMatchObject({ unit: 'defects' });
  });

  it('shows a QA engineer only names and roles', async () => {
    const { items } = await request('/projects/clinic-booking-app/members', list(Member));

    expect(items.every((member) => member.email === undefined)).toBe(true);
    expect(items.every((member) => member.workload === undefined)).toBe(true);
  });

  it('refuses the list to a developer', async () => {
    await expect(request('/projects/payments-api/members', list(Member))).rejects.toMatchObject({
      status: 403,
    });
  });
});

describe('invitations', () => {
  it('invites new people, who show as invited', async () => {
    await request(`${ECOM.replace('/members', '')}/invitations`, none, {
      method: 'POST',
      body: { emails: ['new.tester@shop-team.com'], role: 'qa-engineer' },
    });

    const { items } = await request(ECOM, list(Member));
    expect(items.at(-1)).toMatchObject({ name: 'new.tester@shop-team.com', status: 'invited' });
  });

  it('refuses to invite someone already in the project', async () => {
    await expect(
      request(`${ECOM.replace('/members', '')}/invitations`, none, {
        method: 'POST',
        body: { emails: ['qays.kaled@shop-team.com'], role: 'developer' },
      }),
    ).rejects.toMatchObject({
      status: 422,
      fields: { emails: 'qays.kaled@shop-team.com is already in this project.' },
    });
  });
});

describe('roles', () => {
  it('changes a member’s role', async () => {
    await request(`${ECOM}/batool-mahmoud`, none, { method: 'PATCH', body: { role: 'qa-lead' } });

    expect(
      getDb().memberships.find(
        (entry) =>
          entry.projectId === 'e-commerce-portal-v2' && entry.personId === 'batool-mahmoud',
      )?.role,
    ).toBe('qa-lead');
  });

  it('leaves the project manager and the person’s own role alone', async () => {
    await expect(
      request(`${ECOM}/maria-ayman`, none, { method: 'PATCH', body: { role: 'developer' } }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      request(`${ECOM}/batool-hani`, none, { method: 'PATCH', body: { role: 'developer' } }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
