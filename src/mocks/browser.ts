import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

function isApi(data: unknown) {
  const request = (data as { request?: unknown } | null)?.request;
  return request instanceof Request && new URL(request.url).pathname.startsWith('/api/');
}

export async function startMocks() {
  await worker.start({
    quiet: true,
    onUnhandledFrame({ frame, defaults }) {
      if (frame.protocol === 'http' && isApi(frame.data)) defaults.error();
    },
  });
}
