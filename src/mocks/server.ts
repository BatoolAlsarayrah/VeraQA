import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';

import { setFlags } from './api';
import { resetDb } from './db';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

export function mockServer() {
  beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
  beforeEach(() => {
    resetDb();
    setFlags({ instantJobs: true, slowNetwork: false, failNext: false });
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}
