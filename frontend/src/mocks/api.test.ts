import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { HttpError, none, request } from '@/lib';

import { api, fail, getFlags, setFlags } from './api';
import { getDb } from './db';
import { body, inProject } from './rules';
import { mockServer, server } from './server';

mockServer();

function withPeople() {
  const db = getDb();
  db.people.push(
    {
      id: 'lina',
      firstName: 'Lina',
      lastName: 'Saeed',
      email: 'lina@x.com',
      password: 'Demo#2026',
    },
    {
      id: 'qays',
      firstName: 'Qays',
      lastName: 'Kaled',
      email: 'qays@x.com',
      password: 'Demo#2026',
    },
  );
  db.projects.push({
    id: 'shop',
    name: 'Shop',
    description: '',
    solo: false,
    stage: 'reviewing-requirements',
    createdAt: new Date().toISOString(),
    settings: {
      targetDate: null,
      environments: ['Staging, Chrome 130'],
      rules: { bulkApproval: true, rejectReason: true, engineersReportDefects: true },
      ai: { flagVague: true, flagMissing: true, flagContradictions: true, suggestRewrites: true },
      language: 'en',
    },
  });
  db.memberships.push(
    { projectId: 'shop', personId: 'lina', role: 'qa-lead' },
    { projectId: 'shop', personId: 'qays', role: 'developer' },
  );
  return db;
}

const Reason = z.object({ reason: z.string().min(1, 'Write a reason before you reject it.') });

function useRoutes() {
  server.use(
    api.get('/ping', () => ({ ok: true })),
    api.post('/nothing', () => undefined),
    api.get('/projects/:projectId/secret', (context) => {
      inProject(context, 'approve');
      return { ok: true };
    }),
    api.post('/projects/:projectId/reject', async (context) => {
      inProject(context);
      return body(context.request, Reason);
    }),
    api.get('/teapot', () => {
      throw fail(409, 'conflict', 'Someone changed this while you were working.');
    }),
  );
}

const Ok = z.object({ ok: z.boolean() });

describe('mock routes', () => {
  it('answer with JSON, or 204 when there is nothing to send', async () => {
    useRoutes();

    await expect(request('/ping', Ok)).resolves.toEqual({ ok: true });
    await expect(request('/nothing', none, { method: 'POST' })).resolves.toBeUndefined();
  });

  it('send failures in the agreed error shape', async () => {
    useRoutes();

    await expect(request('/teapot', Ok)).rejects.toMatchObject({
      status: 409,
      code: 'conflict',
      message: 'Someone changed this while you were working.',
    });
  });

  it('fail the next request once when asked, for testing error states', async () => {
    useRoutes();
    setFlags({ failNext: true });

    await expect(request('/ping', Ok)).rejects.toMatchObject({ status: 500, code: 'server_error' });
    expect(getFlags().failNext).toBe(false);
    await expect(request('/ping', Ok)).resolves.toEqual({ ok: true });
  });
});

describe('mock rules', () => {
  it('answer 401 when nobody is signed in', async () => {
    useRoutes();
    withPeople().signedIn = null;

    await expect(
      request('/projects/shop/secret', Ok, { unauthorized: 'throw' }),
    ).rejects.toMatchObject({ status: 401, code: 'unauthenticated' });
  });

  it('answer 404 for a project the person isn’t in, so it isn’t revealed', async () => {
    useRoutes();
    withPeople().signedIn = 'lina';

    await expect(request('/projects/other/secret', Ok)).rejects.toMatchObject({
      status: 404,
      code: 'not_found',
    });
  });

  it('answer 403 when the role lacks the capability', async () => {
    useRoutes();
    withPeople().signedIn = 'qays';

    const error = await request('/projects/shop/secret', Ok).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ status: 403, code: 'forbidden' });
  });

  it('let the role through when it has the capability', async () => {
    useRoutes();
    withPeople().signedIn = 'lina';

    await expect(request('/projects/shop/secret', Ok)).resolves.toEqual({ ok: true });
  });

  it('answer 422 with a message per field for an invalid body', async () => {
    useRoutes();
    withPeople().signedIn = 'lina';

    await expect(
      request('/projects/shop/reject', Reason, { method: 'POST', body: { reason: '' } }),
    ).rejects.toMatchObject({
      status: 422,
      code: 'validation',
      fields: { reason: 'Write a reason before you reject it.' },
    });
  });
});
