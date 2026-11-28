import { describe, expect, it } from 'vitest';

import type { ActivityEntry } from '@/types';

import { activityText, actorName } from './activity';

const entry = (over: Partial<ActivityEntry>): ActivityEntry => ({
  id: 'act-1',
  at: '2026-11-25T10:00:00.000Z',
  actor: { type: 'person', id: 'qays-kaled', name: 'Qays Kaled' },
  type: 'defects',
  action: 'started-fixing',
  item: { type: 'defect', id: 'BUG-009', title: 'Confirmation email arrives after 5 minutes' },
  count: null,
  ...over,
});

describe('activity sentences', () => {
  it('reads like the dashboard in Figma', () => {
    expect(`${actorName(entry({}))} ${activityText(entry({}))}`).toBe(
      'Qays Kaled moved BUG-009 to In progress',
    );
  });

  it('names AI work as AI analysis', () => {
    const flagged = entry({
      actor: { type: 'ai' },
      action: 'flagged',
      type: 'ai',
      count: 8,
      item: { type: 'file', id: 'srs-2', title: 'SRS_v2.pdf' },
    });

    expect(`${actorName(flagged)} ${activityText(flagged)}`).toBe(
      'AI analysis flagged 8 issues in SRS_v2.pdf',
    );
  });

  it('names a run in full', () => {
    expect(
      activityText(
        entry({
          action: 'started-run',
          item: { type: 'run', id: '12', title: 'Sprint 4 regression' },
        }),
      ),
    ).toBe('started Run 12 · Sprint 4 regression');
  });
});
