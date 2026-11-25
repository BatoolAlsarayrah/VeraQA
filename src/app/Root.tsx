import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useMatches } from 'react-router';

import { useSession } from '@/hooks';
import type { Capability } from '@/types';

import { deepestHandle } from './handle';

export function Root() {
  const session = useSession();
  const found = deepestHandle(useMatches());
  const projectId = found?.params.projectId ?? session.currentProjectId;
  const membership = session.memberships.find((entry) => entry.projectId === projectId);
  const can = (capability: Capability) => membership?.capabilities.includes(capability) ?? false;
  const title = found
    ? typeof found.handle.title === 'function'
      ? found.handle.title(found.params, can)
      : found.handle.title
    : undefined;

  useEffect(() => {
    document.title = title ? `${title} · VeraQA` : 'VeraQA';
  }, [title]);

  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
