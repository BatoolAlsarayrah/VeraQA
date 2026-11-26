import type { DefectStatus, Severity } from '@/types';

import type { DefectRecord } from '../db';
import type { Clock } from './clock';
import { CLINIC, ECOM, LIB, PAY } from './projects';

type Action = DefectRecord['history'][number]['action'];
type Event = [action: Action, actor: string, at: string, note?: string];

type Spec = {
  id: string;
  title: string;
  severity: Severity;
  assignee: string;
  source: [run: number, testCaseId: string, step: number] | null;
  steps: string[];
  expected: string;
  actual: string;
  environment?: string;
  events: Event[];
};

const after: Record<Action, DefectStatus | null> = {
  reported: 'open',
  assigned: null,
  'started-fixing': 'in-progress',
  'marked-fixed': 'fixed',
  'marked-invalid': 'invalid',
  'started-retest': 'retest',
  'retest-passed': 'closed',
  'retest-failed': 'reopened',
  reopened: 'reopened',
};

function build(projectId: string, spec: Spec): DefectRecord {
  let status: DefectStatus = 'open';
  let retestCount = 0;
  const record: DefectRecord = {
    projectId,
    id: spec.id,
    title: spec.title,
    severity: spec.severity,
    status,
    assigneeId: spec.assignee,
    reporterId: spec.events[0]?.[1] ?? spec.assignee,
    steps: spec.steps,
    expected: spec.expected,
    actual: spec.actual,
    environment: spec.environment ?? 'Staging, Chrome 130',
    evidence: [],
    source: spec.source && {
      run: spec.source[0],
      testCaseId: spec.source[1],
      step: spec.source[2],
    },
    notes: [],
    retests: [],
    history: [],
    reportedAt: spec.events[0]?.[2] ?? '',
    updatedAt: spec.events.at(-1)?.[2] ?? '',
  };
  for (const [action, actorId, at, note = null] of spec.events) {
    status = after[action] ?? status;
    record.history.push({ action, actorId, at, status, note });
    if (action === 'marked-fixed' && note)
      record.notes.push({ kind: 'fix', authorId: actorId, text: note, at });
    if (action === 'marked-invalid' && note) {
      record.notes.push({ kind: 'invalid', authorId: actorId, text: note, at });
    }
    if (action === 'retest-passed' || action === 'retest-failed') {
      retestCount += 1;
      record.retests.push({
        n: retestCount,
        outcome: action === 'retest-passed' ? 'passed' : 'failed',
        byId: actorId,
        note,
        at,
      });
    }
  }
  record.status = status;
  return record;
}

const BH = 'batool-hani';
const BM = 'batool-mahmoud';
const QK = 'qays-kaled';
const LS = 'lina-saeed';

function ecommerce(t: Clock): Spec[] {
  return [
    {
      id: 'BUG-001',
      title: 'Order number missing from the confirmation page',
      severity: 'medium',
      assignee: LS,
      source: [10, 'TC-041', 2],
      steps: ['Pay for an order by card.', 'Read the confirmation page.'],
      expected: 'The confirmation page shows the order number.',
      actual: 'The confirmation page shows no order number.',
      events: [
        ['reported', BM, t.daysAgo(47)],
        ['started-fixing', LS, t.daysAgo(46)],
        ['marked-fixed', LS, t.daysAgo(45), 'Added the order number to the confirmation template.'],
        ['started-retest', BM, t.daysAgo(44)],
        ['retest-passed', BM, t.daysAgo(44, 11)],
      ],
    },
    {
      id: 'BUG-002',
      title: 'Typo in the password reset email',
      severity: 'low',
      assignee: QK,
      source: [9, 'TC-011', 2],
      steps: ['Sign in with a wrong password.', 'Choose Reset password.', 'Open the reset email.'],
      expected: 'The email has no spelling mistakes.',
      actual: 'The email says “Reset you password”.',
      events: [
        ['reported', BM, t.daysAgo(61)],
        ['started-fixing', QK, t.daysAgo(60)],
        ['marked-fixed', QK, t.daysAgo(59), 'Fixed the spelling in the reset email template.'],
        ['started-retest', BM, t.daysAgo(58)],
        ['retest-passed', BM, t.daysAgo(58, 11)],
      ],
    },
    {
      id: 'BUG-003',
      title: 'Card payment fails for Visa numbers with spaces',
      severity: 'critical',
      assignee: QK,
      source: [11, 'TC-040', 2],
      steps: [
        'Go to checkout and choose Credit card.',
        'Enter 4111 1111 1111 1111 with the spaces, and pay.',
      ],
      expected: 'The payment goes through and the confirmation page opens.',
      actual: 'The payment fails with “Card number is invalid”.',
      events: [
        ['reported', BM, t.daysAgo(31)],
        ['started-fixing', QK, t.daysAgo(30)],
        [
          'marked-fixed',
          QK,
          t.daysAgo(29),
          'Strip spaces from the card number before checking it.',
        ],
        ['started-retest', BM, t.daysAgo(2, 9)],
        [
          'retest-failed',
          BM,
          t.daysAgo(2, 10),
          'Still fails for Visa numbers with spaces when they are pasted in.',
        ],
      ],
    },
    {
      id: 'BUG-004',
      title: 'Cash on delivery is hidden on mobile',
      severity: 'medium',
      assignee: LS,
      source: [11, 'TC-044', 2],
      steps: ['Open checkout on a phone.', 'Look at the payment options.'],
      expected: 'Cash on delivery is listed.',
      actual: 'Only Credit card is listed.',
      events: [
        ['reported', BM, t.daysAgo(31)],
        ['started-fixing', LS, t.daysAgo(30)],
        [
          'marked-fixed',
          LS,
          t.daysAgo(1, 11, 5),
          'A rule for small screens hid Cash on delivery. Removed it.',
        ],
        ['started-retest', BM, t.ago(60)],
      ],
    },
    {
      id: 'BUG-005',
      title: 'Registration accepts a 6-character password',
      severity: 'high',
      assignee: QK,
      source: [11, 'TC-002', 2],
      steps: ['Open the registration page.', 'Enter a 6-character password and submit.'],
      expected: 'The form shows “Use at least 8 characters”.',
      actual: 'The account is created.',
      events: [
        ['reported', BH, t.daysAgo(31)],
        ['started-fixing', QK, t.daysAgo(29)],
        ['marked-fixed', QK, t.daysAgo(1, 16), 'Raised the minimum length check to 8 characters.'],
      ],
    },
    {
      id: 'BUG-006',
      title: 'Sign-in button overlaps the logo on small screens',
      severity: 'low',
      assignee: LS,
      source: [9, 'TC-008', 1],
      steps: ['Open the sign-in page on a screen 360px wide.'],
      expected: 'The logo and the button don’t overlap.',
      actual: 'The button covers the bottom of the logo.',
      events: [
        ['reported', BM, t.daysAgo(61)],
        ['started-fixing', LS, t.daysAgo(60)],
        ['marked-fixed', LS, t.daysAgo(59), 'Moved the logo above the form on narrow screens.'],
        ['started-retest', BM, t.daysAgo(58)],
        ['retest-passed', BM, t.daysAgo(58, 11)],
      ],
    },
    {
      id: 'BUG-007',
      title: 'Account locks after 6 failed attempts instead of 5',
      severity: 'high',
      assignee: QK,
      source: [12, 'TC-031', 3],
      steps: [
        'Open the sign-in page.',
        'Sign in with the wrong password 4 times.',
        'Sign in with the wrong password a 5th time.',
      ],
      expected: 'The account locks for 15 minutes.',
      actual: 'The account stays active. It locks only after the 6th attempt.',
      events: [
        ['reported', BM, t.ago(170)],
        ['started-fixing', QK, t.ago(12)],
        [
          'marked-fixed',
          QK,
          t.ago(5),
          'Off-by-one in the attempt counter. It now locks on the 5th failed attempt.',
        ],
      ],
    },
    {
      id: 'BUG-008',
      title: 'Order total is rounded before charging',
      severity: 'low',
      assignee: LS,
      source: [10, 'TC-043', 1],
      steps: ['Pay for an order of 49.995 JOD.'],
      expected: 'The card is charged 49.995 JOD.',
      actual: 'The card is charged 50.000 JOD.',
      events: [
        ['reported', BH, t.daysAgo(47)],
        ['started-fixing', LS, t.daysAgo(46)],
        ['marked-fixed', LS, t.daysAgo(45), 'Charge the exact total in fils, with no rounding.'],
        ['started-retest', BH, t.daysAgo(44)],
        ['retest-passed', BH, t.daysAgo(44, 12)],
      ],
    },
    {
      id: 'BUG-009',
      title: 'Confirmation email arrives after 5 minutes',
      severity: 'medium',
      assignee: QK,
      source: [12, 'TC-005', 2],
      steps: ['Register with a new email address.', 'Wait for the confirmation email.'],
      expected: 'The email arrives within 2 minutes.',
      actual: 'The email arrives after 5 minutes.',
      events: [
        ['reported', BM, t.ago(175)],
        ['started-fixing', QK, t.ago(48)],
      ],
    },
    {
      id: 'BUG-010',
      title: 'Cart total doesn’t update when quantity changes',
      severity: 'high',
      assignee: LS,
      source: [12, 'TC-047', 2],
      steps: ['Add an item to the cart.', 'Change the quantity to 3.'],
      expected: 'The cart total updates straight away.',
      actual: 'The cart total stays the same until the page is reloaded.',
      events: [
        ['reported', BM, t.ago(172)],
        ['started-fixing', LS, t.ago(32)],
      ],
    },
    {
      id: 'BUG-011',
      title: '6th sign-in attempt is refused after 5 failures',
      severity: 'medium',
      assignee: QK,
      source: [12, 'TC-031', 4],
      steps: ['Sign in with the wrong password 5 times.', 'Sign in with the correct password.'],
      expected: 'Sign-in works.',
      actual: 'Sign-in is refused.',
      events: [
        ['reported', BM, t.ago(165)],
        [
          'marked-invalid',
          QK,
          t.ago(68),
          'Refusing sign-in after 5 failures is the 15-minute lockout working as specified. It isn’t a defect.',
        ],
      ],
    },
    {
      id: 'BUG-012',
      title: 'Discount code field accepts expired codes',
      severity: 'low',
      assignee: LS,
      source: [11, 'TC-052', 1],
      steps: ['Enter a discount code that ended yesterday.'],
      expected: '“This code has expired” appears.',
      actual: 'The discount is applied.',
      events: [['reported', BM, t.daysAgo(31)]],
    },
  ];
}

function clinic(t: Clock): Spec[] {
  return [
    {
      id: 'BUG-001',
      title: 'The 16:30 slot can’t be booked',
      severity: 'medium',
      assignee: QK,
      source: [1, 'TC-002', 2],
      steps: ['Choose a doctor and the 16:30 slot.', 'Confirm the booking.'],
      expected: 'The booking is confirmed.',
      actual: '“This slot is outside opening hours” appears.',
      events: [
        ['reported', BM, t.daysAgo(19)],
        ['started-fixing', QK, t.daysAgo(18)],
        [
          'marked-fixed',
          QK,
          t.daysAgo(17),
          'The last slot now ends at closing time instead of starting at it.',
        ],
        ['started-retest', BH, t.daysAgo(11)],
        ['retest-passed', BH, t.daysAgo(11, 11)],
      ],
    },
    {
      id: 'BUG-002',
      title: 'Cancelling an appointment shows “Something went wrong”',
      severity: 'high',
      assignee: QK,
      source: [3, 'TC-006', 1],
      steps: ['Open an appointment 3 days away.', 'Choose Cancel.'],
      expected: 'The appointment is cancelled.',
      actual: '“Something went wrong” appears and the appointment stays.',
      events: [
        ['reported', BH, t.daysAgo(2)],
        ['started-fixing', QK, t.daysAgo(1)],
        [
          'marked-fixed',
          QK,
          t.ago(120),
          'The cancel request sent the wrong appointment ID. Fixed.',
        ],
      ],
    },
    {
      id: 'BUG-003',
      title: 'The appointment page crashes for appointments tomorrow',
      severity: 'critical',
      assignee: QK,
      source: [3, 'TC-009', 2],
      steps: ['Open an appointment tomorrow morning.'],
      expected: 'The appointment page opens.',
      actual: 'The page goes blank.',
      events: [
        ['reported', BH, t.daysAgo(4)],
        ['started-fixing', QK, t.daysAgo(4, 13)],
        [
          'marked-fixed',
          QK,
          t.daysAgo(3),
          'Dates in the next 24 hours used the wrong time zone. Fixed.',
        ],
        ['started-retest', BM, t.ago(320)],
        ['retest-passed', BM, t.ago(300)],
      ],
    },
    {
      id: 'BUG-004',
      title: 'Reminder SMS arrives at 18:30',
      severity: 'medium',
      assignee: QK,
      source: [3, 'TC-010', 2],
      steps: ['Book an appointment for tomorrow.', 'Wait for the reminder.'],
      expected: 'The reminder arrives at 18:00.',
      actual: 'The reminder arrives at 18:30.',
      events: [['reported', BM, t.daysAgo(2, 18, 40)]],
    },
    {
      id: 'BUG-005',
      title: 'A taken slot still shows as free',
      severity: 'high',
      assignee: QK,
      source: [3, 'TC-005', 2],
      steps: ['Book a slot.', 'Open the same doctor’s slots as another patient.'],
      expected: 'The slot is shown as taken.',
      actual: 'The slot still looks free and Book stays active.',
      events: [
        ['reported', BM, t.daysAgo(2)],
        ['started-fixing', QK, t.daysAgo(1, 9)],
      ],
    },
  ];
}

function payments(t: Clock): Spec[] {
  const sandbox = 'Sandbox, API client';
  return [
    {
      id: 'BUG-001',
      title: 'Wallet top-up shows the old balance',
      severity: 'medium',
      assignee: BH,
      source: null,
      environment: sandbox,
      steps: ['Top up the wallet with 10.000 JOD.', 'Read the balance in the answer.'],
      expected: 'The answer shows the new balance.',
      actual: 'The answer shows the balance from before the top-up.',
      events: [
        ['reported', BM, t.daysAgo(20)],
        ['started-fixing', BH, t.daysAgo(19)],
        [
          'marked-fixed',
          BH,
          t.daysAgo(18),
          'Return the balance after the top-up is saved, not before.',
        ],
        ['started-retest', BM, t.daysAgo(17)],
        ['retest-passed', BM, t.daysAgo(17, 11)],
      ],
    },
    {
      id: 'BUG-002',
      title: 'Refund email shows the wrong amount',
      severity: 'low',
      assignee: QK,
      source: null,
      environment: sandbox,
      steps: ['Refund 5.000 JOD of a payment.', 'Open the refund email.'],
      expected: 'The email says 5.000 JOD.',
      actual: 'The email says the full payment amount.',
      events: [
        ['reported', BM, t.daysAgo(16)],
        ['started-fixing', QK, t.daysAgo(15)],
        ['marked-fixed', QK, t.daysAgo(14), 'The email template now uses the refunded amount.'],
        ['started-retest', BM, t.daysAgo(5)],
        ['retest-passed', BM, t.daysAgo(5, 11)],
      ],
    },
    {
      id: 'BUG-003',
      title: 'Partial refund fails for amounts with fils',
      severity: 'high',
      assignee: BH,
      source: [4, 'TC-006', 1],
      environment: sandbox,
      steps: ['Refund 0.125 JOD of a payment.'],
      expected: 'The API refunds 0.125 JOD.',
      actual: 'The API answers 500.',
      events: [
        ['reported', BM, t.daysAgo(5)],
        ['started-fixing', BH, t.daysAgo(4)],
        ['marked-fixed', BH, t.daysAgo(3), 'Round refunds to fils instead of whole dinars.'],
        ['started-retest', BM, t.ago(200)],
        ['retest-failed', BM, t.ago(180), 'Still fails for 0.125 JOD. 0.500 JOD works now.'],
      ],
    },
    {
      id: 'BUG-004',
      title: 'Card is charged twice when Pay is pressed twice',
      severity: 'critical',
      assignee: QK,
      source: [4, 'TC-003', 1],
      environment: sandbox,
      steps: ['Send the same charge request twice within a second.'],
      expected: 'The card is charged once.',
      actual: 'The card is charged twice.',
      events: [
        ['reported', BM, t.daysAgo(1, 9)],
        ['started-fixing', QK, t.daysAgo(1, 11)],
      ],
    },
    {
      id: 'BUG-005',
      title: 'Saved card list shows expired cards',
      severity: 'medium',
      assignee: BH,
      source: [4, 'TC-008', 1],
      environment: sandbox,
      steps: ['List the saved cards of a customer with one expired card.'],
      expected: 'The expired card isn’t listed.',
      actual: 'The expired card is listed.',
      events: [
        ['reported', BM, t.daysAgo(1, 11, 40)],
        ['started-fixing', BH, t.ago(500)],
      ],
    },
    {
      id: 'BUG-006',
      title: 'Payment timeout returns “Error 504” with no explanation',
      severity: 'high',
      assignee: BH,
      source: [4, 'TC-009', 1],
      environment: sandbox,
      steps: ['Charge a card that never answers.', 'Wait 30 seconds.'],
      expected: 'The answer explains the timeout and what to do.',
      actual: 'The answer is “Error 504” with no explanation.',
      events: [['reported', BM, t.ago(60)]],
    },
  ];
}

function library(t: Clock): Spec[] {
  const local = 'Local, Chrome 130';
  return [
    {
      id: 'BUG-001',
      title: 'Search misses author names written with hamza',
      severity: 'low',
      assignee: BH,
      source: [1, 'TC-002', 1],
      environment: local,
      steps: ['Search for an author name written with hamza.'],
      expected: 'The author’s books are listed.',
      actual: '“No books match” appears.',
      events: [
        ['reported', BH, t.daysAgo(13)],
        ['started-fixing', BH, t.daysAgo(13, 14)],
        ['marked-fixed', BH, t.daysAgo(12), 'Search now treats hamza forms as the same letter.'],
        ['started-retest', BH, t.daysAgo(12, 15)],
        ['retest-passed', BH, t.daysAgo(12, 16)],
      ],
    },
    {
      id: 'BUG-002',
      title: 'Late fines also charge the return day',
      severity: 'medium',
      assignee: BH,
      source: [2, 'TC-007', 1],
      environment: local,
      steps: ['Return a book 4 days after its due date.'],
      expected: 'A fine of 1.00 JOD is charged.',
      actual: 'A fine of 1.25 JOD is charged.',
      events: [
        ['reported', BH, t.daysAgo(2)],
        ['started-fixing', BH, t.daysAgo(1)],
        ['marked-fixed', BH, t.ago(300), 'Count late days from the day after the due date.'],
      ],
    },
    {
      id: 'BUG-003',
      title: 'A 4th loan goes through when the 3rd is due today',
      severity: 'medium',
      assignee: BH,
      source: [2, 'TC-005', 1],
      environment: local,
      steps: ['Give a member 3 loans, one of them due today.', 'Lend them a 4th book.'],
      expected: 'The loan is refused.',
      actual: 'The loan goes through.',
      events: [['reported', BH, t.daysAgo(2, 11)]],
    },
  ];
}

export function defects(t: Clock): DefectRecord[] {
  return [
    ...ecommerce(t).map((spec) => build(ECOM, spec)),
    ...clinic(t).map((spec) => build(CLINIC, spec)),
    ...payments(t).map((spec) => build(PAY, spec)),
    ...library(t).map((spec) => build(LIB, spec)),
  ];
}
