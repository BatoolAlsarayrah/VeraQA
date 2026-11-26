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
  forgetSession();
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

function clearCurrentProject() {
  current = null;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Storage can be blocked; the choice is already gone from memory.
  }
  listeners.forEach((listener) => listener());
}

const forgetters = new Set<() => void>();

export function onForgetSession(forget: () => void) {
  forgetters.add(forget);
}

// The tab can switch people (sign out, then someone else signs in), so nothing the last person
// chose or saw running may carry over.
export function forgetSession() {
  queryClient.clear();
  clearCurrentProject();
  forgetters.forEach((forget) => forget());
}
