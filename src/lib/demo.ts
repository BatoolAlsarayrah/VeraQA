import { paths } from './paths';

// Stand-in until Phase 3: the shell's counts and notifications come from the mock API (and later the live API).
type Counts = {
  myWork: number;
  pendingReview: number;
  openDefects: number;
};

export type Notice = {
  title: string;
  detail?: string;
  time: string;
  to: string;
  unread: boolean;
};

const counts: Record<string, Counts> = {
  'e-commerce-portal-v2': { myWork: 6, pendingReview: 5, openDefects: 7 },
  'clinic-booking-app': { myWork: 4, pendingReview: 5, openDefects: 7 },
  'payments-api': { myWork: 0, pendingReview: 0, openDefects: 0 },
  'library-system': { myWork: 6, pendingReview: 5, openDefects: 7 },
};

export function demoCounts(projectId: string): Counts {
  return counts[projectId] ?? { myWork: 0, pendingReview: 0, openDefects: 0 };
}

type Row = [
  title: string,
  detail: string,
  time: string,
  to: (p: string) => string,
  unread: boolean,
];

const lead: Row[] = [
  [
    '35 test case drafts are ready for review',
    'From 7 approved scenarios',
    'Just now',
    paths.generateTestCases,
    true,
  ],
  [
    '9 scenario drafts are ready for review',
    'From 21 approved requirements',
    '2 min ago',
    paths.generateScenarios,
    true,
  ],
  [
    'Qays Kaled marked BUG-007 as fixed',
    'Off-by-one in the attempt counter. Start the retest when you’re ready.',
    '5 minutes ago',
    (p) => paths.defect(p, 'BUG-007'),
    true,
  ],
  [
    'Qays Kaled started fixing BUG-007',
    'Account locks after 6 failed attempts instead of 5.',
    '12 minutes ago',
    (p) => paths.defect(p, 'BUG-007'),
    true,
  ],
  [
    'AI analysis of SRS_v2.pdf is ready',
    '26 requirements found. 5 are waiting for your decision.',
    '20 minutes ago',
    paths.requirements,
    true,
  ],
  [
    'Lina Saeed started fixing BUG-010',
    'Cart total doesn’t update when quantity changes.',
    '32 minutes ago',
    (p) => paths.defect(p, 'BUG-010'),
    true,
  ],
  [
    'Batool Mahmoud failed TC-031 and reported BUG-007',
    'Account locks after 6 failed attempts instead of 5.',
    'Today, 10:58',
    (p) => paths.defect(p, 'BUG-007'),
    true,
  ],
  [
    'BUG-004 is ready for retest',
    'Lina Saeed marked it fixed.',
    'Yesterday, 11:05',
    (p) => paths.defect(p, 'BUG-004'),
    false,
  ],
  [
    'Lina Saeed accepted your invite',
    'Joined as a developer.',
    'Yesterday, 09:12',
    paths.members,
    false,
  ],
  [
    'BUG-003 was reopened after a failed retest',
    'Card payment fails for Visa numbers with spaces.',
    'Monday',
    (p) => paths.defect(p, 'BUG-003'),
    false,
  ],
];

const engineer: Row[] = [
  [
    'Batool Hani assigned you 3 test cases',
    'Run 12 · Sprint 4 regression: TC-033, TC-040, TC-032.',
    '1 hour ago',
    paths.myWork,
    true,
  ],
  [
    'BUG-007 is fixed',
    'Qays Kaled marked it fixed. Start the retest when you’re ready.',
    '2 hours ago',
    (p) => paths.defect(p, 'BUG-007'),
    true,
  ],
  [
    'Batool Hani approved SC-007 and SC-008',
    'You can now add their test cases to a run.',
    'Yesterday, 15:22',
    paths.scenarios,
    false,
  ],
  [
    'Run 12 · Sprint 4 regression started',
    '34 test cases, 12 of them assigned to you.',
    'Monday',
    paths.runs,
    false,
  ],
];

const developer: Row[] = [
  [
    'Batool Mahmoud assigned you BUG-007',
    'Account locks after 6 failed attempts instead of 5. High.',
    '1 hour ago',
    (p) => paths.defect(p, 'BUG-007'),
    true,
  ],
  [
    'BUG-003 failed retest and was reopened',
    'Still fails for Visa numbers with spaces.',
    '3 hours ago',
    (p) => paths.defect(p, 'BUG-003'),
    true,
  ],
  [
    'Batool Hani assigned you BUG-009',
    'Confirmation email arrives after 5 minutes. Medium.',
    'Yesterday, 11:40',
    (p) => paths.defect(p, 'BUG-009'),
    false,
  ],
  [
    'BUG-002 was closed',
    'Typo in the password reset email.',
    'Monday',
    (p) => paths.defect(p, 'BUG-002'),
    false,
  ],
];

const lists: Record<string, Row[]> = {
  'e-commerce-portal-v2': lead,
  'clinic-booking-app': engineer,
  'payments-api': developer,
  'library-system': lead,
};

export function demoNotifications(projectId: string): Notice[] {
  return (lists[projectId] ?? []).map(([title, detail, time, to, unread]) => ({
    title,
    detail,
    time,
    to: to(projectId),
    unread,
  }));
}

export type DemoAnalysis = { files: string[]; startedAt: number; done: boolean } | null;

const ANALYSIS_KEY = 'veraqa-analysis';
export const analysisSteps = 4;
export const analysisStepMs = 1300;
export const analysisFound = { requirements: 26, issues: 8 };

function storedAnalysis(): DemoAnalysis {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(ANALYSIS_KEY) ?? 'null');
    return typeof parsed === 'object' && parsed !== null ? (parsed as DemoAnalysis) : null;
  } catch {
    return null;
  }
}

let analysis = storedAnalysis();
const analysisListeners = new Set<() => void>();

export function getDemoAnalysis() {
  return analysis;
}

export function setDemoAnalysis(next: DemoAnalysis) {
  analysis = next;
  try {
    if (next) sessionStorage.setItem(ANALYSIS_KEY, JSON.stringify(next));
    else sessionStorage.removeItem(ANALYSIS_KEY);
  } catch {
    // Storage can be blocked; the state still holds for this page.
  }
  analysisListeners.forEach((listener) => listener());
}

export function subscribeDemoAnalysis(listener: () => void) {
  analysisListeners.add(listener);
  return () => {
    analysisListeners.delete(listener);
  };
}
