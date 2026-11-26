import { queryOptions } from '@tanstack/react-query';

import { Session } from '@/types';

import { none, request } from './api-client';
import { keys, queryClient } from './query';

// A 401 here is handled by the route guard (go to Sign in) or ignored (the /dev page), so the
// global 401 redirect stays out of it.
export const sessionQuery = queryOptions({
  queryKey: keys.session,
  queryFn: () => request('/session', Session, { unauthorized: 'throw' }),
  staleTime: 5 * 60_000,
});

export async function signOut() {
  await request('/auth/sign-out', none, { method: 'POST', unauthorized: 'throw' });
  queryClient.clear();
}

const KEY = 'veraqa-project';
const listeners = new Set<() => void>();

function read() {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

let current = read();

export function getCurrentProject() {
  return current;
}

export function setCurrentProject(projectId: string) {
  if (current === projectId) return;
  current = projectId;
  try {
    sessionStorage.setItem(KEY, projectId);
  } catch {
    // Storage can be blocked; the choice still holds for this page.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeCurrentProject(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
