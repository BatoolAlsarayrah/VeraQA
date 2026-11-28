import { describe, expect, it } from 'vitest';

import { request } from '@/lib';
import { ActivityEntry, list } from '@/types';

import { getDb } from '../db';
import { mockServer } from '../server';

mockServer();

const ECOM = '/projects/e-commerce-portal-v2/activity';
const get = (query: Record<string, string> = {}) => request(ECOM, list(ActivityEntry), { query });

describe('activity log', () => {
  it('lists every change in the project, newest first', async () => {
    const { items } = await get();

    expect(items).toHaveLength(22);
    expect(items[0]).toMatchObject({
      actor: { type: 'person', name: 'Qays Kaled' },
      action: 'marked-fixed',
      item: { type: 'defect', id: 'BUG-007' },
    });
    const times = items.map((entry) => entry.at);
    expect([...times].sort().reverse()).toEqual(times);
  });

  it('filters by person, by the AI, and by type', async () => {
    const qays = await get({ person: 'qays-kaled' });
    const ai = await get({ person: 'ai' });
    const invalid = await get({ type: 'invalid' });

    expect(
      qays.items.every((entry) => entry.actor.type === 'person' && entry.actor.id === 'qays-kaled'),
    ).toBe(true);
    expect(ai.items.every((entry) => entry.actor.type === 'ai')).toBe(true);
    expect(ai.items[0]).toMatchObject({ action: 'flagged', count: 8 });
    expect(invalid.items.map((entry) => entry.item.id)).toEqual(['BUG-011']);
  });

  it('is only for people who manage', async () => {
    getDb().signedIn = 'batool-mahmoud';

    await expect(get()).rejects.toMatchObject({ status: 403 });
  });
});
