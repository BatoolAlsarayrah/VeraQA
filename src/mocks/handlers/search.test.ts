import { describe, expect, it } from 'vitest';

import { request } from '@/lib';
import { list, SearchResult } from '@/types';

import { mockServer } from '../server';

mockServer();

const search = (projectId: string, query: Record<string, string>) =>
  request(`/projects/${projectId}/search`, list(SearchResult), { query });

describe('search', () => {
  it('finds requirements, scenarios, test cases and defects by ID, title or text', async () => {
    const { items } = await search('e-commerce-portal-v2', { q: 'LOCK' });
    const ids = items.map((entry) => entry.item.id);

    expect(ids).toEqual(expect.arrayContaining(['REQ-014', 'SC-007', 'TC-031', 'BUG-007']));
    expect(items.find((entry) => entry.item.id === 'TC-031')).toMatchObject({
      status: 'failed',
      priority: 'high',
      assignee: { name: 'Batool Mahmoud' },
    });
  });

  it('filters by type, status and priority', async () => {
    const open = await search('e-commerce-portal-v2', { type: 'defect', status: 'open' });
    const critical = await search('e-commerce-portal-v2', { priority: 'critical' });

    expect(open.items.map((entry) => entry.item.id)).toEqual(['BUG-012']);
    expect(critical.items.map((entry) => entry.item.id)).toEqual(['BUG-003']);
  });

  it('finds only a developer’s own defects', async () => {
    const all = await search('payments-api', {});
    const someoneElses = await search('payments-api', { q: 'BUG-004' });

    expect(all.items.map((entry) => entry.item.id)).toEqual([
      'BUG-001',
      'BUG-003',
      'BUG-005',
      'BUG-006',
    ]);
    expect(someoneElses.items).toEqual([]);
  });
});
