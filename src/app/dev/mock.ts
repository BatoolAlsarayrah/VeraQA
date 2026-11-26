import { forgetSession, queryClient } from '@/lib';
import { getFlags, setFlags } from '@/mocks/api';
import { getDb, resetDb, saveDb } from '@/mocks/db';
import type { Role } from '@/types';

export const mockMode = import.meta.env.VITE_API_MODE === 'mock';

export function people() {
  return getDb().people.map((person) => ({
    id: person.id,
    name: `${person.firstName} ${person.lastName}`,
    email: person.email,
  }));
}

export function signedInAs() {
  return getDb().signedIn;
}

export function signInAs(personId: string) {
  getDb().signedIn = personId;
  saveDb();
  forgetSession();
}

export function setRole(projectId: string, personId: string, role: Role) {
  const membership = getDb().memberships.find(
    (entry) => entry.projectId === projectId && entry.personId === personId,
  );
  if (!membership) return;
  membership.role = role;
  saveDb();
  void queryClient.invalidateQueries();
}

export function resetDemo() {
  resetDb().signedIn = 'batool-hani';
  saveDb();
  setFlags({ failNext: false });
  forgetSession();
}

export { getFlags, setFlags };

export function resetLink() {
  return getDb().resetLink ?? null;
}
