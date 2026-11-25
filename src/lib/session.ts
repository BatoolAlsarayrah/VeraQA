import type { Membership, Role, Session } from '@/types';

import { capabilitiesFor } from './permissions';

// Stand-in until Phase 3: the mock API (and later the live API) supplies the session through setSession.
const KEY = 'veraqa-project';

const demo: { projectId: string; projectName: string; role: Role }[] = [
  { projectId: 'e-commerce-portal-v2', projectName: 'E-Commerce Portal v2', role: 'qa-lead' },
  { projectId: 'clinic-booking-app', projectName: 'Clinic booking app', role: 'qa-engineer' },
  { projectId: 'payments-api', projectName: 'Payments API', role: 'developer' },
  { projectId: 'library-system', projectName: 'Library system', role: 'project-manager' },
];

const memberships: Membership[] = demo.map((entry) => ({
  ...entry,
  capabilities: capabilitiesFor(entry.role),
}));

function stored() {
  try {
    const id = sessionStorage.getItem(KEY);
    return memberships.some((entry) => entry.projectId === id) ? id : null;
  } catch {
    return null;
  }
}

export function demoSession(): Session {
  return {
    user: { name: 'Batool Hani', email: 'batool.hani@shop-team.com' },
    memberships,
    currentProjectId: stored() ?? 'e-commerce-portal-v2',
  };
}

let session = demoSession();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getSession() {
  return session;
}

export function setSession(next: Session) {
  session = next;
  notify();
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setCurrentProject(projectId: string) {
  if (session.currentProjectId === projectId) return;
  if (!session.memberships.some((entry) => entry.projectId === projectId)) return;
  try {
    sessionStorage.setItem(KEY, projectId);
  } catch {
    // Storage can be blocked; the choice still holds for this page.
  }
  setSession({ ...session, currentProjectId: projectId });
}
