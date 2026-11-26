import { z } from 'zod';

import { ApiError } from '@/types';

type Query = Record<string, string | number | boolean | null | undefined>;

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  form?: FormData;
  query?: Query;
  signal?: AbortSignal;
  unauthorized?: 'redirect' | 'throw';
};

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string>;

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export class NetworkError extends Error {
  constructor() {
    super('VeraQA couldn’t reach the server. Check your connection, then try again.');
    this.name = 'NetworkError';
  }
}

export class ContractError extends Error {
  readonly endpoint: string;
  readonly field: string;

  constructor(endpoint: string, field: string, detail: string) {
    super(`${endpoint} returned data that doesn’t match the API contract at ${field}: ${detail}`);
    this.name = 'ContractError';
    this.endpoint = endpoint;
    this.field = field;
  }
}

export const none = z.void();

const fallback: Record<number, string> = {
  400: 'The server couldn’t read that request. Try again.',
  403: 'You don’t have access to that. Ask your project manager if you need it.',
  404: 'That item doesn’t exist anymore. Go back and pick another.',
  409: 'Someone changed this while you were working. Reload, then try again.',
  413: 'That file is too large. Use a file of 10 MB or less.',
  422: 'Check the highlighted fields, then try again.',
};

let onUnauthorized = () => {};

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

function url(path: string, query: Query = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  }
  const search = params.toString();
  const base = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  return `${base}/api${path}${search ? `?${search}` : ''}`;
}

function fieldPath(path: PropertyKey[]) {
  return path.length ? path.map(String).join('.') : '(the whole response)';
}

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function toHttpError(response: Response) {
  const parsed = ApiError.safeParse(await readJson(response));
  if (parsed.success) {
    const { code, message, fields } = parsed.data.error;
    return new HttpError(response.status, code, message, fields);
  }
  const message =
    fallback[response.status] ??
    (response.status >= 500
      ? 'Something went wrong on the server. Try again in a moment.'
      : 'That didn’t work. Try again.');
  return new HttpError(response.status, 'unknown', message);
}

export async function request<T extends z.ZodType>(
  path: string,
  schema: T,
  options: Options = {},
): Promise<z.infer<T>> {
  const method = options.method ?? 'GET';
  const endpoint = `${method} /api${path}`;
  const headers: Record<string, string> = { Accept: 'application/json' };
  let body: BodyInit | undefined;
  if (options.form) body = options.form;
  else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(url(path, options.query), {
      method,
      headers,
      body,
      credentials: 'include',
      signal: options.signal ?? null,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new NetworkError();
  }

  if (!response.ok) {
    const error = await toHttpError(response);
    if (response.status === 401 && options.unauthorized !== 'throw') onUnauthorized();
    throw error;
  }

  const data = response.status === 204 ? undefined : await readJson(response);
  const result = schema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new ContractError(
      endpoint,
      fieldPath(issue?.path ?? []),
      issue?.message ?? 'Invalid value',
    );
  }
  return result.data;
}
