import { afterEach, describe, expect, it } from 'vitest';

import { DB_VERSION, getDb, nextId, resetDb, saveDb } from './db';

afterEach(() => {
  resetDb();
});

describe('mock db', () => {
  it('keeps changes in localStorage until it is reset', () => {
    const db = resetDb();
    const seeded = db.invitations.length;
    db.signedIn = 'batool-hani';
    db.invitations.push({
      id: 'inv-1',
      projectId: 'p',
      email: 'a@b.com',
      role: 'qa-engineer',
      invitedBy: 'x',
      at: new Date().toISOString(),
    });
    saveDb();

    const stored = JSON.parse(localStorage.getItem('veraqa-mock-db') ?? '{}') as {
      version: number;
      invitations: unknown[];
    };
    expect(stored.version).toBe(DB_VERSION);
    expect(stored.invitations).toHaveLength(seeded + 1);
  });

  it('goes back to the seed on reset, but keeps who is signed in', () => {
    const db = getDb();
    const seeded = db.invitations.length;
    db.signedIn = 'maria-ayman';
    db.invitations.push({
      id: 'inv-1',
      projectId: 'p',
      email: 'a@b.com',
      role: 'qa-engineer',
      invitedBy: 'x',
      at: new Date().toISOString(),
    });

    const fresh = resetDb();

    expect(fresh.invitations).toHaveLength(seeded);
    expect(fresh.signedIn).toBe('maria-ayman');
  });
});

describe('nextId', () => {
  it('continues after the highest ID, zero-padded', () => {
    expect(nextId('BUG', ['BUG-007', 'BUG-012', 'BUG-003'])).toBe('BUG-013');
    expect(nextId('REQ', [])).toBe('REQ-001');
  });
});
