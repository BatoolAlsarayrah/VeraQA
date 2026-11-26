import { describe, expect, it } from 'vitest';

import { none, request } from '@/lib';
import { list, Notification } from '@/types';

import { mockServer } from '../server';

mockServer();

const ECOM = 'e-commerce-portal-v2';

const forProject = (projectId: string, unread = false) =>
  request('/notifications', list(Notification), { query: { projectId, unread: unread || null } });

describe('notifications', () => {
  it('lists the person’s notifications for a project, newest first', async () => {
    const { items } = await forProject(ECOM);

    expect(items).toHaveLength(10);
    expect(items[0]).toMatchObject({
      title: 'Qays Kaled marked BUG-007 as fixed',
      actor: { type: 'person', name: 'Qays Kaled' },
      target: { type: 'defect', id: 'BUG-007' },
    });
    const times = items.map((item) => item.at);
    expect([...times].sort().reverse()).toEqual(times);
  });

  it('filters to unread ones', async () => {
    const { items } = await forProject(ECOM, true);

    expect(items).toHaveLength(6);
    expect(items.every((item) => item.unread)).toBe(true);
  });

  it('hides a project the person isn’t in', async () => {
    await expect(forProject('mobile-banking-app')).rejects.toMatchObject({ status: 404 });
  });

  it('marks one as read, but only the person’s own', async () => {
    const { items } = await forProject(ECOM, true);
    await request(`/notifications/${items[0]?.id ?? ''}/read`, none, { method: 'POST' });

    await expect(forProject(ECOM, true)).resolves.toMatchObject({ items: { length: 5 } });
    await expect(
      request('/notifications/note-21/read', none, { method: 'POST' }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('marks all as read in one project and leaves the others', async () => {
    await request('/notifications/read-all', none, { method: 'POST', query: { projectId: ECOM } });

    await expect(forProject(ECOM, true)).resolves.toEqual({ items: [] });
    await expect(forProject('clinic-booking-app', true)).resolves.toMatchObject({
      items: { length: 3 },
    });
  });
});
