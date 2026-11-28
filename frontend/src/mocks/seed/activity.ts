import type { ActivityEntry, ActivityType, ItemType } from '@/types';

import type { ActivityRecord } from '../db';
import type { Clock } from './clock';
import { CLINIC, ECOM, LIB, PAY } from './projects';

export type Titles = (projectId: string, type: ItemType, id: string) => string;

type Spec = [
  projectId: string,
  at: string,
  actor: string,
  type: ActivityType,
  action: ActivityEntry['action'],
  item: [type: ItemType, id: string],
  count?: number,
];

export function activity(t: Clock, titles: Titles): ActivityRecord[] {
  const specs: Spec[] = [
    [ECOM, t.ago(5), 'qays-kaled', 'defects', 'marked-fixed', ['defect', 'BUG-007']],
    [ECOM, t.ago(12), 'qays-kaled', 'defects', 'started-fixing', ['defect', 'BUG-007']],
    [ECOM, t.ago(30), 'batool-hani', 'requirements', 'approved', ['requirement', 'REQ-013']],
    [ECOM, t.ago(32), 'lina-saeed', 'defects', 'started-fixing', ['defect', 'BUG-010']],
    [ECOM, t.ago(48), 'qays-kaled', 'defects', 'started-fixing', ['defect', 'BUG-009']],
    [ECOM, t.ago(68), 'qays-kaled', 'invalid', 'marked-invalid', ['defect', 'BUG-011']],
    [ECOM, t.ago(70), 'ai', 'ai', 'flagged', ['file', 'SRS_v2.pdf'], 8],
    [ECOM, t.ago(72), 'batool-hani', 'srs', 'uploaded', ['file', 'SRS_v2.pdf']],
    [ECOM, t.ago(72), 'batool-hani', 'srs', 'uploaded', ['file', 'NFR_addendum.docx']],
    [ECOM, t.ago(110), 'batool-mahmoud', 'scenarios', 'edited', ['scenario', 'SC-009']],
    [ECOM, t.ago(165), 'batool-mahmoud', 'defects', 'reported', ['defect', 'BUG-011']],
    [ECOM, t.ago(170), 'batool-mahmoud', 'defects', 'reported', ['defect', 'BUG-007']],
    [ECOM, t.ago(171), 'batool-mahmoud', 'runs', 'failed', ['test-case', 'TC-031']],
    [ECOM, t.ago(176), 'batool-mahmoud', 'runs', 'passed', ['test-case', 'TC-044']],
    [ECOM, t.ago(178), 'batool-hani', 'blocked', 'blocked', ['test-case', 'TC-040']],
    [ECOM, t.daysAgo(1, 16), 'qays-kaled', 'defects', 'marked-fixed', ['defect', 'BUG-005']],
    [ECOM, t.daysAgo(1, 11, 5), 'lina-saeed', 'defects', 'marked-fixed', ['defect', 'BUG-004']],
    [ECOM, t.daysAgo(2, 10), 'batool-mahmoud', 'defects', 'retest-failed', ['defect', 'BUG-003']],
    [ECOM, t.daysAgo(2, 9, 40), 'ai', 'ai', 'drafted', ['scenario', 'SC-007'], 3],
    [
      ECOM,
      t.daysAgo(3, 15, 22),
      'batool-hani',
      'scenarios',
      'approved',
      ['requirement', 'REQ-019'],
      2,
    ],
    [ECOM, t.daysAgo(3, 15), 'ai', 'ai', 'drafted', ['requirement', 'REQ-014'], 3],
    [ECOM, t.daysAgo(22, 9), 'batool-hani', 'runs', 'started-run', ['run', '12']],
    [CLINIC, t.ago(300), 'batool-mahmoud', 'defects', 'retest-passed', ['defect', 'BUG-003']],
    [CLINIC, t.ago(120), 'qays-kaled', 'defects', 'marked-fixed', ['defect', 'BUG-002']],
    [CLINIC, t.daysAgo(2), 'batool-hani', 'defects', 'reported', ['defect', 'BUG-002']],
    [CLINIC, t.daysAgo(5), 'batool-mahmoud', 'runs', 'started-run', ['run', '3']],
    [
      CLINIC,
      t.daysAgo(28),
      'batool-mahmoud',
      'requirements',
      'rejected',
      ['requirement', 'REQ-012'],
    ],
    [PAY, t.ago(60), 'batool-mahmoud', 'defects', 'reported', ['defect', 'BUG-006']],
    [PAY, t.ago(180), 'batool-mahmoud', 'defects', 'retest-failed', ['defect', 'BUG-003']],
    [PAY, t.daysAgo(1, 9), 'batool-mahmoud', 'defects', 'reported', ['defect', 'BUG-004']],
    [PAY, t.daysAgo(6), 'batool-mahmoud', 'runs', 'started-run', ['run', '4']],
    [LIB, t.ago(300), 'batool-hani', 'defects', 'marked-fixed', ['defect', 'BUG-002']],
    [LIB, t.daysAgo(2, 11), 'batool-hani', 'defects', 'reported', ['defect', 'BUG-003']],
    [LIB, t.daysAgo(3), 'batool-hani', 'runs', 'started-run', ['run', '2']],
    [LIB, t.daysAgo(24), 'batool-hani', 'requirements', 'rejected', ['requirement', 'REQ-010']],
  ];
  return specs.map(([projectId, at, actorId, type, action, [itemType, id], count], index) => ({
    id: `act-${index + 1}`,
    projectId,
    at,
    actor: actorId === 'ai' ? { type: 'ai' } : { type: 'person', id: actorId },
    type,
    action,
    item: { type: itemType, id, title: titles(projectId, itemType, id) },
    count: count ?? null,
  }));
}
