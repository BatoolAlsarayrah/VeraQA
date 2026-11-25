import type { Attachment, BlockedReason, StepResult, TestResult } from '@/types';

import type { EntryRecord, RunRecord, TestCaseRecord } from '../db';
import type { Clock } from './clock';
import { CLINIC, ECOM, LIB, PAY } from './projects';

const BH = 'batool-hani';
const BM = 'batool-mahmoud';

type Options = {
  step?: number;
  actual?: string;
  blocked?: { reason: BlockedReason; details: string; defectId: string | null };
  ready?: boolean;
  due?: number;
  evidence?: Attachment[];
};

type Spec = [testCaseId: string, assignee: string, result: TestResult, options?: Options];

function steps(count: number, result: TestResult, options: Options): StepResult[] {
  if (result === 'not-run') return [];
  const at = options.step ?? count;
  return Array.from({ length: count }, (_, index) => {
    const n = index + 1;
    if (result === 'passed' || n < at) return { n, result: 'passed', actual: null };
    if (n === at)
      return { n, result, actual: result === 'failed' ? (options.actual ?? null) : null };
    return { n, result: 'not-run', actual: null };
  });
}

function entries(
  t: Clock,
  run: RunRecord,
  cases: TestCaseRecord[],
  specs: Spec[],
  recordedAt: string,
): EntryRecord[] {
  return specs.map(([testCaseId, assignee, result, options = {}]) => {
    const testCase = cases.find(
      (entry) => entry.projectId === run.projectId && entry.id === testCaseId,
    );
    if (!testCase) throw new Error(`Seed run ${run.number} refers to a missing ${testCaseId}`);
    const ran = result !== 'not-run';
    return {
      projectId: run.projectId,
      run: run.number,
      testCaseId,
      assigneeId: assignee,
      due: options.due === undefined ? null : t.day(options.due),
      result,
      environment: ran ? run.environment : null,
      steps: steps(testCase.steps.length, result, options),
      blocked: options.blocked ? { step: options.step ?? 1, ...options.blocked } : null,
      evidence: options.evidence ?? [],
      recordedBy: ran ? assignee : null,
      recordedAt: ran ? recordedAt : null,
      readyToRunAgain: options.ready ?? false,
    };
  });
}

function history(set: string[], failed: string[], blocked: string[], notRun: string[]): Spec[] {
  return set.map((id, index) => [
    id,
    index % 2 === 0 ? BH : BM,
    failed.includes(id)
      ? 'failed'
      : blocked.includes(id)
        ? 'blocked'
        : notRun.includes(id)
          ? 'not-run'
          : 'passed',
    blocked.includes(id)
      ? {
          step: 1,
          blocked: {
            reason: 'environment-down',
            details: 'Staging was down for maintenance.',
            defectId: null,
          },
        }
      : failed.includes(id)
        ? { step: 1, actual: 'It didn’t work as expected. See the defect for details.' }
        : {},
  ]);
}

function record(
  projectId: string,
  number: number,
  name: string,
  environment: string,
  startedAt: string,
  closedAt: string | null,
): RunRecord {
  return {
    projectId,
    number,
    name,
    environment,
    status: closedAt ? 'closed' : 'active',
    startedAt,
    closedAt,
  };
}

const chrome = 'Staging, Chrome 130';

export function runs(t: Clock, cases: TestCaseRecord[]) {
  const ecomRuns = [
    record(ECOM, 9, 'Sprint 1 regression', chrome, t.daysAgo(64), t.daysAgo(60, 17)),
    record(ECOM, 10, 'Sprint 2 regression', chrome, t.daysAgo(50), t.daysAgo(46, 17)),
    record(ECOM, 11, 'Sprint 3 regression', chrome, t.daysAgo(36), t.daysAgo(30, 17)),
    record(ECOM, 12, 'Sprint 4 regression', chrome, t.daysAgo(22, 9), null),
    record(ECOM, 13, 'Sprint 4 retest', chrome, t.ago(40), null),
  ];
  const ecomSet = cases
    .filter((entry) => entry.projectId === ECOM && entry.status === 'approved')
    .map((entry) => entry.id)
    .filter((id) => !['TC-046', 'TC-049', 'TC-050', 'TC-051'].includes(id));
  const [r9, r10, r11, r12, r13] = ecomRuns as [
    RunRecord,
    RunRecord,
    RunRecord,
    RunRecord,
    RunRecord,
  ];

  const visaDefect =
    'Card payment fails for Visa numbers with spaces, and the test card is stored with spaces.';
  const r12Specs: Spec[] = [
    ['TC-001', BH, 'passed'],
    ['TC-002', BH, 'passed'],
    ['TC-003', BH, 'passed'],
    ['TC-004', BH, 'passed'],
    ['TC-005', BM, 'failed', { step: 2, actual: 'The email arrived after 5 minutes.' }],
    ['TC-006', BM, 'passed'],
    ['TC-007', BM, 'passed'],
    ['TC-008', BM, 'passed'],
    ['TC-009', BM, 'not-run', { due: 1 }],
    ['TC-010', BM, 'passed'],
    ['TC-011', BM, 'passed'],
    ['TC-012', BM, 'passed'],
    ['TC-013', BM, 'not-run', { due: 1 }],
    ['TC-014', BM, 'passed'],
    [
      'TC-031',
      BM,
      'failed',
      {
        step: 3,
        actual: 'The account stayed active after the 5th attempt and locked after the 6th.',
        evidence: [
          { id: 'ev-tc031-r12', name: 'TC-031-step-3.png', size: 253_952, type: 'image/png' },
        ],
      },
    ],
    ['TC-032', BH, 'not-run', { due: 0 }],
    ['TC-033', BM, 'not-run', { due: 0 }],
    ['TC-034', BM, 'not-run', { due: 1 }],
    ['TC-035', BM, 'not-run', { due: 2 }],
    ['TC-037', BH, 'passed'],
    ['TC-038', BH, 'passed'],
    ['TC-039', BM, 'not-run', { due: 2 }],
    [
      'TC-040',
      BH,
      'blocked',
      {
        step: 2,
        blocked: { reason: 'blocked-by-defect', details: visaDefect, defectId: 'BUG-003' },
      },
    ],
    ['TC-041', BH, 'passed'],
    ['TC-042', BH, 'passed'],
    ['TC-043', BM, 'not-run', { due: 2 }],
    ['TC-044', BM, 'passed'],
    ['TC-046', BM, 'not-run', { due: 2 }],
    [
      'TC-047',
      BM,
      'failed',
      {
        step: 2,
        actual:
          'The line total changed, but the cart total stayed the same until the page was reloaded.',
      },
    ],
    ['TC-048', BH, 'passed'],
    ['TC-049', BH, 'not-run', { due: 1 }],
    ['TC-050', BH, 'passed'],
    ['TC-051', BH, 'not-run', { due: 1 }],
    ['TC-052', BM, 'not-run', { due: 2 }],
  ];

  const clinicRuns = [
    record(CLINIC, 1, 'Sprint 1 regression', chrome, t.daysAgo(20), t.daysAgo(18, 17)),
    record(CLINIC, 2, 'Sprint 1 retest', chrome, t.daysAgo(12), t.daysAgo(11, 17)),
    record(CLINIC, 3, 'Sprint 2 regression', chrome, t.daysAgo(5), null),
  ];
  const [c1, c2, c3] = clinicRuns as [RunRecord, RunRecord, RunRecord];
  const clinicSet = [
    'TC-001',
    'TC-002',
    'TC-003',
    'TC-004',
    'TC-005',
    'TC-006',
    'TC-007',
    'TC-008',
    'TC-009',
    'TC-010',
    'TC-011',
    'TC-012',
  ];

  const payRuns = [
    record(
      PAY,
      3,
      'Release 1.1 regression',
      'Sandbox, API client',
      t.daysAgo(40),
      t.daysAgo(35, 17),
    ),
    record(PAY, 4, 'Release 1.2 regression', 'Sandbox, API client', t.daysAgo(6), null),
  ];
  const [p3, p4] = payRuns as [RunRecord, RunRecord];
  const paySet = [
    'TC-001',
    'TC-002',
    'TC-003',
    'TC-004',
    'TC-005',
    'TC-006',
    'TC-007',
    'TC-008',
    'TC-009',
    'TC-010',
  ];

  const libRuns = [
    record(LIB, 1, 'First pass', 'Local, Chrome 130', t.daysAgo(15), t.daysAgo(12, 17)),
    record(LIB, 2, 'Final check', 'Local, Chrome 130', t.daysAgo(3), null),
  ];
  const [l1, l2] = libRuns as [RunRecord, RunRecord];
  const libSet = ['TC-001', 'TC-002', 'TC-003', 'TC-004', 'TC-005', 'TC-006', 'TC-007', 'TC-008'];

  const all: EntryRecord[] = [
    ...entries(
      t,
      r9,
      cases,
      history(ecomSet, ['TC-008', 'TC-011'], ['TC-043'], ['TC-009', 'TC-035']),
      t.daysAgo(61),
    ),
    ...entries(
      t,
      r10,
      cases,
      history(ecomSet, ['TC-041', 'TC-043'], ['TC-039'], []),
      t.daysAgo(47),
    ),
    ...entries(
      t,
      r11,
      cases,
      history(ecomSet, ['TC-002', 'TC-040', 'TC-044', 'TC-052'], [], []),
      t.daysAgo(31),
    ),
    ...entries(t, r12, cases, r12Specs, t.ago(178)),
    ...entries(
      t,
      r13,
      cases,
      [
        ['TC-002', BM, 'not-run', { due: 0 }],
        ['TC-031', BM, 'not-run', { due: 0 }],
        ['TC-044', BM, 'not-run', { due: 0 }],
      ],
      t.ago(40),
    ),
    ...entries(t, c1, cases, history(clinicSet, ['TC-002'], [], []), t.daysAgo(19)),
    ...entries(t, c2, cases, [['TC-002', BH, 'passed']], t.daysAgo(11)),
    ...entries(
      t,
      c3,
      cases,
      [
        ['TC-001', BM, 'passed'],
        ['TC-002', BM, 'passed'],
        ['TC-003', BM, 'passed'],
        ['TC-004', BH, 'not-run', { due: 0 }],
        [
          'TC-005',
          BM,
          'failed',
          { step: 2, actual: 'The slot still looked free, and Book stayed active.' },
        ],
        [
          'TC-006',
          BH,
          'failed',
          {
            step: 1,
            actual: 'Cancelling showed “Something went wrong” and the appointment stayed.',
          },
        ],
        ['TC-007', BM, 'passed'],
        ['TC-008', BH, 'not-run', { due: 1 }],
        [
          'TC-009',
          BH,
          'blocked',
          {
            step: 2,
            blocked: {
              reason: 'blocked-by-defect',
              details: 'The cancellation page crashed for appointments tomorrow.',
              defectId: 'BUG-003',
            },
            ready: true,
            due: 0,
          },
        ],
        ['TC-010', BM, 'failed', { step: 2, actual: 'The reminder arrived at 18:30.' }],
        ['TC-011', BM, 'passed'],
        ['TC-012', BM, 'not-run', { due: 2 }],
        ['TC-013', BH, 'not-run', { due: 2 }],
      ],
      t.daysAgo(2),
    ),
    ...entries(
      t,
      p3,
      cases,
      history(paySet, [], [], []).map(([id, , result, options]) => [id, BM, result, options]),
      t.daysAgo(37),
    ),
    ...entries(
      t,
      p4,
      cases,
      [
        ['TC-001', BM, 'passed'],
        ['TC-002', BM, 'passed'],
        [
          'TC-003',
          BM,
          'failed',
          {
            step: 1,
            actual: 'The card was charged twice and the answers had different payment IDs.',
          },
        ],
        ['TC-004', BM, 'not-run', { due: 1 }],
        ['TC-005', BM, 'passed'],
        ['TC-006', BM, 'failed', { step: 1, actual: 'The API answered 500 for 0.125 JOD.' }],
        ['TC-007', BM, 'passed'],
        [
          'TC-008',
          BM,
          'failed',
          { step: 1, actual: 'The card that expired last month was still in the list.' },
        ],
        [
          'TC-009',
          BM,
          'failed',
          { step: 1, actual: 'The API answered “Error 504” with no explanation.' },
        ],
        ['TC-010', BM, 'not-run', { due: 2 }],
      ],
      t.daysAgo(1),
    ),
    ...entries(
      t,
      l1,
      cases,
      history(libSet, ['TC-002'], [], []).map(([id, , result, options]) => [
        id,
        BH,
        result,
        options,
      ]),
      t.daysAgo(13),
    ),
    ...entries(
      t,
      l2,
      cases,
      [
        ['TC-001', BH, 'passed'],
        ['TC-002', BH, 'passed'],
        ['TC-003', BH, 'passed'],
        ['TC-004', BH, 'passed'],
        [
          'TC-005',
          BH,
          'failed',
          { step: 1, actual: 'The 4th loan went through when the 3rd book was due today.' },
        ],
        ['TC-006', BH, 'passed'],
        [
          'TC-007',
          BH,
          'failed',
          { step: 1, actual: 'The fine was 1.25 JOD. The return day was charged too.' },
        ],
        ['TC-008', BH, 'passed'],
        ['TC-009', BH, 'not-run', { due: 1 }],
      ],
      t.daysAgo(2),
    ),
  ];

  return { runs: [...ecomRuns, ...clinicRuns, ...payRuns, ...libRuns], entries: all };
}
