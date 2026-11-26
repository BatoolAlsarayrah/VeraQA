import { describe, expect, it } from 'vitest';

import { ContractError, HttpError, NetworkError } from './api-client';
import { createQueryClient, keys } from './query';

const retry = createQueryClient().getDefaultOptions().queries?.retry;

function retries(failures: number, error: Error) {
  if (typeof retry !== 'function') throw new Error('retry should be a function');
  return retry(failures, error);
}

describe('query defaults', () => {
  it('retries a network failure or a server error once', () => {
    expect(retries(0, new NetworkError())).toBe(true);
    expect(retries(0, new HttpError(503, 'unknown', 'Down'))).toBe(true);
    expect(retries(1, new NetworkError())).toBe(false);
  });

  it('never retries what a retry can’t fix', () => {
    expect(retries(0, new HttpError(403, 'forbidden', 'No'))).toBe(false);
    expect(retries(0, new HttpError(404, 'not_found', 'Gone'))).toBe(false);
    expect(retries(0, new ContractError('GET /api/x', 'items.0', 'Invalid'))).toBe(false);
  });

  it('sends contract errors to the error page', () => {
    const throwOnError = createQueryClient().getDefaultOptions().queries?.throwOnError;
    if (typeof throwOnError !== 'function') throw new Error('throwOnError should be a function');

    expect(throwOnError(new ContractError('GET /api/x', 'a', 'b'), {} as never)).toBe(true);
    expect(throwOnError(new HttpError(422, 'validation', 'Check'), {} as never)).toBe(false);
  });
});

describe('keys', () => {
  it('nest project data under the project, so one prefix refreshes it all', () => {
    expect(keys.project('library-system')).toEqual(['projects', 'library-system']);
    expect(keys.project('library-system').slice(0, 1)).toEqual(keys.projects);
  });
});
