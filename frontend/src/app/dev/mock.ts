import { forgetSession, queryClient } from '@/lib';
import { getFlags, setFlags } from '@/mocks/api';
import { getDb, resetDb, saveDb } from '@/mocks/db';
import { closeAfterRetest } from '@/mocks/handlers/defects';
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

export function defectStatus(projectId: string, id: string) {
  return getDb().defects.find((entry) => entry.projectId === projectId && entry.id === id)?.status;
}

// Closes the defect the way a passed retest does, so blocked tests are released and their testers
// are notified exactly as in the real flow.
export function closeDefect(projectId: string, id: string) {
  const db = getDb();
  const record = db.defects.find((entry) => entry.projectId === projectId && entry.id === id);
  if (!record || record.status === 'closed') return;
  closeAfterRetest(db, record, 'batool-mahmoud', null);
  saveDb();
  void queryClient.invalidateQueries();
}
