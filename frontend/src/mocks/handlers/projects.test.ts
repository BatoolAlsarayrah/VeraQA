import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { none, request } from '@/lib';
import { Counts, Invitation, list, Project, Session, Settings } from '@/types';

import { getDb } from '../db';
import { mockServer } from '../server';

mockServer();

const ECOM = '/projects/e-commerce-portal-v2';

describe('projects', () => {
  it('lists only the projects the person is in, with their role', async () => {
    const { items } = await request('/projects', list(Project));

    expect(items.map((project) => [project.name, project.role, project.stage])).toEqual([
      ['E-Commerce Portal v2', 'qa-lead', 'reviewing-requirements'],
      ['Clinic booking app', 'qa-engineer', 'running-tests'],
      ['Payments API', 'developer', 'fixing-defects'],
      ['Library system', 'project-manager', 'closing-defects'],
    ]);
  });

  it('makes whoever creates a project its project manager', async () => {
    const project = await request('/projects', Project, {
      method: 'POST',
      body: { name: 'Thesis tools', description: 'Final year project', team: 'solo' },
    });

    expect(project).toMatchObject({ id: 'thesis-tools', role: 'project-manager', solo: true });
    const session = await request('/session', Session);
    expect(session.memberships.at(-1)?.capabilities).toContain('owner');
  });

  it('refuses a project without a name', async () => {
    await expect(
      request('/projects', Project, {
        method: 'POST',
        body: { name: '', description: '', team: 'team' },
      }),
    ).rejects.toMatchObject({ status: 422, fields: { name: 'Give the project a name.' } });
  });
});

describe('counts', () => {
  it.each([
    ['e-commerce-portal-v2', { myWork: 9, pendingReview: 5, openDefects: 7 }],
    ['clinic-booking-app', { myWork: 5, pendingReview: 1, openDefects: 3 }],
    ['payments-api', { myWork: 3, pendingReview: 0, openDefects: 3 }],
    ['library-system', { myWork: 3, pendingReview: 1, openDefects: 2 }],
  ])('counts what is waiting for Batool Hani in %s', async (projectId, counts) => {
    await expect(request(`/projects/${projectId}/counts`, Counts)).resolves.toEqual(counts);
  });

  it('hides a project the person isn’t in', async () => {
    await expect(request('/projects/mobile-banking-app/counts', Counts)).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe('invitations', () => {
  it('lists the invitation and joins the project on accept', async () => {
    const { items } = await request('/invitations', list(Invitation));
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      project: { name: 'Mobile banking app' },
      role: 'qa-engineer',
      invitedBy: { name: 'Lina Saeed' },
    });

    const project = await request(`/invitations/${items[0]?.id ?? ''}/accept`, Project, {
      method: 'POST',
    });

    expect(project.role).toBe('qa-engineer');
    expect(getDb().notifications[0]).toMatchObject({
      personId: 'lina-saeed',
      title: 'Batool Hani accepted your invite',
    });
    await expect(request('/invitations', list(Invitation))).resolves.toEqual({ items: [] });
  });

  it('drops the invitation on decline', async () => {
    await request('/invitations/inv-mobile-banking/decline', none, { method: 'POST' });

    await expect(request('/invitations', list(Invitation))).resolves.toEqual({ items: [] });
    await expect(request('/projects/mobile-banking-app/counts', Counts)).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe('settings', () => {
  it('shows the settings, with fixed prefixes, to people who manage', async () => {
    const settings = await request(`${ECOM}/settings`, Settings);

    expect(settings.prefixes).toEqual({
      requirement: 'REQ',
      scenario: 'SC',
      testCase: 'TC',
      defect: 'BUG',
    });
    expect(settings.projectManager.name).toBe('Maria Ayman');
  });

  it('refuses them to a QA engineer', async () => {
    await expect(request('/projects/clinic-booking-app/settings', Settings)).rejects.toMatchObject({
      status: 403,
    });
  });

  it('saves changes', async () => {
    const settings = await request(`${ECOM}/settings`, Settings, {
      method: 'PATCH',
      body: { description: 'Online store rebuild', language: 'ar' },
    });

    expect(settings).toMatchObject({ description: 'Online store rebuild', language: 'ar' });
  });
});

describe('danger zone', () => {
  it('is only for the project manager', async () => {
    await expect(
      request(`${ECOM}/transfer`, none, { method: 'POST', body: { memberId: 'batool-mahmoud' } }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('hands over the project and keeps the old manager on as QA lead', async () => {
    getDb().signedIn = 'maria-ayman';

    await request(`${ECOM}/transfer`, none, { method: 'POST', body: { memberId: 'batool-hani' } });

    const roles = getDb()
      .memberships.filter((entry) => entry.projectId === 'e-commerce-portal-v2')
      .map((entry) => [entry.personId, entry.role]);
    expect(roles).toContainEqual(['batool-hani', 'project-manager']);
    expect(roles).toContainEqual(['maria-ayman', 'qa-lead']);
  });

  it('can’t hand a solo project to nobody', async () => {
    await expect(
      request('/projects/library-system/transfer', none, {
        method: 'POST',
        body: { memberId: 'batool-hani' },
      }),
    ).rejects.toMatchObject({ status: 422, fields: { memberId: expect.any(String) as string } });
  });

  it('deletes everything in the project once the name is typed exactly', async () => {
    const path = '/projects/library-system';
    await expect(
      request(path, none, { method: 'DELETE', body: { confirmName: 'library system' } }),
    ).rejects.toMatchObject({ status: 422 });

    await request(path, none, { method: 'DELETE', body: { confirmName: 'Library system' } });

    expect(getDb().requirements.some((entry) => entry.projectId === 'library-system')).toBe(false);
    await expect(request(`${path}/counts`, z.unknown())).rejects.toMatchObject({ status: 404 });
  });
});
