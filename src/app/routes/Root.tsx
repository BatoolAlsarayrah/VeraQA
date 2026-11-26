import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useMatches } from 'react-router';

import { getCurrentProject, sessionQuery } from '@/lib';
import type { Capability } from '@/types';

import { deepestHandle, resolve } from './handle';

export function Root() {
  const session = useQuery(sessionQuery).data;
  const found = deepestHandle(useMatches());
  const projectId = found?.params.projectId ?? getCurrentProject();
  const membership = session?.memberships.find((entry) => entry.projectId === projectId);
  const can = (capability: Capability) => membership?.capabilities.includes(capability) ?? false;
  const title = found ? resolve(found.handle.title, found.params, can) : undefined;

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
