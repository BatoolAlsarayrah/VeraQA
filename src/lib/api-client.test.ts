import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import {
  ContractError,
  HttpError,
  NetworkError,
  none,
  request,
  setUnauthorizedHandler,
} from './api-client';

const fetchMock = vi.fn<typeof fetch>();

function reply(status: number, body?: unknown) {
  fetchMock.mockResolvedValueOnce(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function lastCall() {
  const [input, init] = fetchMock.mock.calls.at(-1) ?? [];
  return { url: typeof input === 'string' ? input : '', init: init ?? {} };
}

const Counts = z.object({ myWork: z.number(), openDefects: z.number() });

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  setUnauthorizedHandler(() => {});
});

describe('request', () => {
  it('calls /api with the session cookie and returns the parsed body', async () => {
    reply(200, { myWork: 6, openDefects: 7 });

    await expect(request('/projects/p/counts', Counts)).resolves.toEqual({
      myWork: 6,
      openDefects: 7,
    });
    expect(lastCall().url).toBe('/api/projects/p/counts');
    expect(lastCall().init.credentials).toBe('include');
    expect(lastCall().init.method).toBe('GET');
  });

  it('adds query params and leaves out empty filters', async () => {
    reply(200, { myWork: 0, openDefects: 0 });

    await request('/projects/p/defects', Counts, {
      query: { status: 'open', assignee: '', q: null, severity: undefined, page: 2 },
    });

    expect(lastCall().url).toBe('/api/projects/p/defects?status=open&page=2');
  });

  it('sends JSON bodies with a JSON content type', async () => {
    reply(204);

    await request('/projects/p/requirements/REQ-015/reject', none, {
      method: 'POST',
      body: { reason: 'Duplicate of REQ-014' },
    });

    expect(lastCall().init.body).toBe('{"reason":"Duplicate of REQ-014"}');
    expect(lastCall().init.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });

  it('sends files as form data and lets the browser set the content type', async () => {
    reply(202, { jobId: 'job-1' });
    const form = new FormData();
    form.append('files', new Blob(['x']), 'SRS_v2.pdf');

    await request('/projects/p/srs', z.object({ jobId: z.string() }), { method: 'POST', form });

    expect(lastCall().init.body).toBe(form);
    expect(lastCall().init.headers).not.toHaveProperty('Content-Type');
  });

  it('throws a contract error naming the endpoint and the field', async () => {
    reply(200, { myWork: 6, openDefects: 'seven' });

    const error = await request('/projects/p/counts', Counts).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ContractError);
    expect(error).toMatchObject({
      endpoint: 'GET /api/projects/p/counts',
      field: 'openDefects',
    });
  });

  it('turns the error body into an HttpError with the message for people', async () => {
    reply(422, {
      error: {
        code: 'validation',
        message: 'Check the highlighted fields, then try again.',
        fields: { reason: 'Write a reason before you reject it.' },
      },
    });

    const error = await request('/x', none, { method: 'POST', body: {} }).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({
      status: 422,
      code: 'validation',
      message: 'Check the highlighted fields, then try again.',
      fields: { reason: 'Write a reason before you reject it.' },
    });
  });

  it('falls back to a plain message when the error body is not the agreed shape', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Bad gateway', { status: 502 }));

    await expect(request('/x', none)).rejects.toMatchObject({
      status: 502,
      code: 'unknown',
      message: 'Something went wrong on the server. Try again in a moment.',
    });
  });

  it('sends people to sign in on a 401', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    reply(401, { error: { code: 'unauthenticated', message: 'Sign in to continue.' } });

    await expect(request('/session', none)).rejects.toBeInstanceOf(HttpError);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('leaves a 401 to the caller when asked, as sign-in does', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    reply(401, { error: { code: 'unauthenticated', message: 'Sign in to continue.' } });

    await expect(request('/session', none, { unauthorized: 'throw' })).rejects.toBeInstanceOf(
      HttpError,
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it('reports a network failure plainly', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(request('/session', none)).rejects.toBeInstanceOf(NetworkError);
  });
});
