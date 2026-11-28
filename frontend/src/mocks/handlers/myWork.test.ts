import { describe, expect, it } from 'vitest';

import { none, request } from '@/lib';
import { Counts, MyWork } from '@/types';

import { getDb } from '../db';
import { mockServer } from '../server';

mockServer();

const path = (projectId: string) => `/projects/${projectId}/my-work`;
const summary = (work: MyWork) =>
  work.groups.map((group) => [group.kind, group.items.map((entry) => entry.item.id)]);

describe('my work', () => {
  it('groups what a QA lead has to review, approve, run and retest', async () => {
    const work = await request(path('e-commerce-portal-v2'), MyWork);

    expect(summary(work)).toEqual([
      ['requirements-to-review', ['REQ-015', 'REQ-018', 'REQ-020']],
      ['drafts-to-approve', ['SC-009', 'TC-045']],
      ['tests-to-run', ['TC-032', 'TC-049', 'TC-051']],
      ['retests', ['BUG-005']],
    ]);
    expect(work.groups[0]?.items[0]).toMatchObject({
      openFindings: 3,
      due: expect.any(String) as string,
    });
    expect(work.groups[1]?.items[0]?.draftedFor).toMatchObject({ id: 'REQ-014' });
    expect(work.groups[2]?.items[0]?.run).toEqual({ number: 12, name: 'Sprint 4 regression' });
    expect(work.groups[3]?.items[0]).toMatchObject({
      fixedBy: { name: 'Qays Kaled' },
      retest: { id: 'TC-002' },
    });
  });

  it('shows a QA engineer a test that is ready to run again', async () => {
    const work = await request(path('clinic-booking-app'), MyWork);

    expect(summary(work)).toEqual([
      ['tests-to-run', ['TC-004', 'TC-008', 'TC-013']],
      ['ready-to-run-again', ['TC-009']],
      ['retests', ['BUG-002']],
    ]);
    expect(work.groups[1]?.items[0]?.blockedBy).toMatchObject({ id: 'BUG-003', status: 'closed' });
    expect(work.groups[1]?.items[0]?.blockedStep).toBe(2);
    expect(work.groups[0]?.items[0]?.blockedStep).toBeNull();
  });

  it('includes defects to fix for a solo project manager', async () => {
    const work = await request(path('library-system'), MyWork);

    expect(summary(work)).toEqual([
      ['tests-to-run', ['TC-009']],
      ['retests', ['BUG-002']],
      ['defects-to-fix', ['BUG-003']],
    ]);
  });

  it('matches the My work count in the sidebar', async () => {
    for (const projectId of ['e-commerce-portal-v2', 'clinic-booking-app', 'library-system']) {
      const work = await request(path(projectId), MyWork);
      const counts = await request(`/projects/${projectId}/counts`, Counts);
      expect(work.groups.reduce((sum, group) => sum + group.items.length, 0)).toBe(counts.myWork);
    }
  });
});

describe('assignments', () => {
  const assign = (body: unknown) =>
    request('/projects/e-commerce-portal-v2/assignments', none, { method: 'POST', body });

  it('assigns items with a due date, and tells the person', async () => {
    await assign({
      items: [{ type: 'requirement', id: 'REQ-023' }],
      assigneeId: 'maria-ayman',
      due: '2026-12-01',
    });

    expect(
      getDb().requirements.find(
        (entry) => entry.projectId === 'e-commerce-portal-v2' && entry.id === 'REQ-023',
      ),
    ).toMatchObject({
      assigneeId: 'maria-ayman',
      due: '2026-12-01',
    });
    expect(getDb().notifications[0]).toMatchObject({
      personId: 'maria-ayman',
      title: 'Batool Hani assigned you 1 item',
    });
  });

  it('sends reviews to people who can approve, and defects to people who can fix', async () => {
    await expect(
      assign({
        items: [{ type: 'requirement', id: 'REQ-023' }],
        assigneeId: 'batool-mahmoud',
        due: null,
      }),
    ).rejects.toMatchObject({ status: 422, fields: { assigneeId: expect.any(String) as string } });
    await expect(
      assign({
        items: [{ type: 'defect', id: 'BUG-012' }],
        assigneeId: 'batool-mahmoud',
        due: null,
      }),
    ).rejects.toMatchObject({ status: 422 });
    await expect(
      assign({ items: [{ type: 'defect', id: 'BUG-012' }], assigneeId: 'qays-kaled', due: null }),
    ).resolves.toBeUndefined();
  });

  it('is only for people who manage', async () => {
    getDb().signedIn = 'batool-mahmoud';

    await expect(
      assign({
        items: [{ type: 'requirement', id: 'REQ-023' }],
        assigneeId: 'batool-hani',
        due: null,
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
