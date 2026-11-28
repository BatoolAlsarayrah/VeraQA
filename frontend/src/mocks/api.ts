import { delay, http, HttpResponse } from 'msw';

import { type Db, getDb, saveDb } from './db';
import { settleJobs } from './jobs';

export type Context = {
  request: Request;
  params: Record<string, string>;
  url: URL;
  db: Db;
};

type Resolver = (context: Context) => unknown;

export class Failure extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string> | undefined;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function fail(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
) {
  return new Failure(status, code, message, fields);
}

export function created(data: unknown) {
  return HttpResponse.json(data as never, { status: 201 });
}

export function accepted(data: unknown) {
  return HttpResponse.json(data as never, { status: 202 });
}

function errorResponse(failure: Failure) {
  const error = {
    code: failure.code,
    message: failure.message,
    ...(failure.fields && { fields: failure.fields }),
  };
  return HttpResponse.json({ error }, { status: failure.status });
}

export type Flags = {
  instantJobs: boolean;
  slowNetwork: boolean;
  failNext: boolean;
  expiredLinks: boolean;
};

const FLAGS_KEY = 'veraqa-mock-flags';
const noFlags: Flags = {
  instantJobs: false,
  slowNetwork: false,
  failNext: false,
  expiredLinks: false,
};

let flags: Flags | null = null;

export function getFlags(): Flags {
  if (flags) return flags;
  try {
    flags = {
      ...noFlags,
      ...(JSON.parse(localStorage.getItem(FLAGS_KEY) ?? '{}') as Partial<Flags>),
    };
  } catch {
    flags = noFlags;
  }
  return flags;
}

export function setFlags(next: Partial<Flags>) {
  flags = { ...getFlags(), ...next };
  try {
    localStorage.setItem(FLAGS_KEY, JSON.stringify(flags));
  } catch {
    // Storage can be blocked; the flags then last until the page reloads.
  }
}

function between(min: number, max: number) {
  return min + Math.round(Math.random() * (max - min));
}

async function latency() {
  if (import.meta.env.MODE === 'test') return;
  await delay(getFlags().slowNetwork ? between(2500, 4000) : between(150, 600));
}

function wrap(resolver: Resolver) {
  return async ({ request, params }: { request: Request; params: Record<string, unknown> }) => {
    await latency();
    if (getFlags().failNext) {
      setFlags({ failNext: false });
      return errorResponse(
        fail(500, 'server_error', 'Something went wrong on the server. Try again in a moment.'),
      );
    }
    const db = getDb();
    settleJobs(db, Date.now());
    try {
      const result = await resolver({
        request,
        params: params as Record<string, string>,
        url: new URL(request.url),
        db,
      });
      saveDb();
      if (result instanceof Response) return result;
      if (result === undefined) return new HttpResponse(null, { status: 204 });
      return HttpResponse.json(result as never);
    } catch (error) {
      if (error instanceof Failure) return errorResponse(error);
      throw error;
    }
  };
}

export const api = {
  get: (path: string, resolver: Resolver) => http.get(`*/api${path}`, wrap(resolver)),
  post: (path: string, resolver: Resolver) => http.post(`*/api${path}`, wrap(resolver)),
  put: (path: string, resolver: Resolver) => http.put(`*/api${path}`, wrap(resolver)),
  patch: (path: string, resolver: Resolver) => http.patch(`*/api${path}`, wrap(resolver)),
  delete: (path: string, resolver: Resolver) => http.delete(`*/api${path}`, wrap(resolver)),
};
