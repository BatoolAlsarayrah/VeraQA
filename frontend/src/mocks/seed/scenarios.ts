import type { Priority, ReviewStatus, ScenarioType, TestDataItem } from '@/types';

import type { EventRecord, ScenarioRecord } from '../db';
import type { Clock } from './clock';
import { CLINIC, ECOM, LIB, PAY } from './projects';

type Spec = {
  id: string;
  req: string;
  title: string;
  type: ScenarioType;
  priority: Priority | null;
  description: string;
  precondition?: string;
  testData?: TestDataItem[];
  status?: ReviewStatus;
  assignee?: string;
  due?: number;
  editedBy?: string;
};

function build(
  t: Clock,
  projectId: string,
  decider: string,
  draftedAt: string,
  spec: Spec,
): ScenarioRecord {
  const status = spec.status ?? 'approved';
  const history: EventRecord[] = [
    { at: draftedAt, actor: { type: 'ai' }, action: 'drafted', note: null },
  ];
  if (spec.editedBy) {
    history.push({
      at: t.ago(110),
      actor: { type: 'person', id: spec.editedBy },
      action: 'edited',
      note: null,
    });
  }
  if (status === 'approved') {
    history.push({
      at: draftedAt,
      actor: { type: 'person', id: decider },
      action: 'approved',
      note: null,
    });
  }
  return {
    projectId,
    id: spec.id,
    requirementId: spec.req,
    title: spec.title,
    description: spec.description,
    precondition: spec.precondition ?? null,
    type: spec.type,
    testData: spec.testData ?? [],
    status,
    priority: spec.priority,
    origin: 'ai',
    assigneeId: spec.assignee ?? null,
    due: spec.due === undefined ? null : t.day(spec.due),
    rejectionReason: null,
    history,
  };
}

const account = 'An active account exists.';

function ecommerce(t: Clock) {
  const specs: Spec[] = [
    {
      id: 'SC-001',
      req: 'REQ-011',
      title: 'Register with a new email and a valid password',
      type: 'positive',
      priority: 'high',
      description:
        'A new visitor registers with an unused email and a password that meets the rules, and can sign in straight away.',
    },
    {
      id: 'SC-002',
      req: 'REQ-011',
      title: 'Refuse an email that is already registered',
      type: 'negative',
      priority: 'medium',
      description:
        'Registering again with an email that already has an account is refused with a clear message.',
      precondition: 'An account is already registered with the email used.',
    },
    {
      id: 'SC-003',
      req: 'REQ-013',
      title: 'Confirmation email arrives within 2 minutes',
      type: 'positive',
      priority: 'high',
      description:
        'After registering, the confirmation email arrives in the inbox within 2 minutes.',
    },
    {
      id: 'SC-004',
      req: 'REQ-013',
      title: 'Resend the confirmation email on request',
      type: 'positive',
      priority: 'low',
      description: 'A person who didn’t get the email can ask for it again from the sign-in page.',
      status: 'pending-review',
    },
    {
      id: 'SC-005',
      req: 'REQ-010',
      title: 'Sign in with a registered email and password',
      type: 'positive',
      priority: 'high',
      description: 'A registered person signs in with the right email and password.',
      precondition: account,
    },
    {
      id: 'SC-006',
      req: 'REQ-010',
      title: 'Refuse a wrong password',
      type: 'negative',
      priority: 'high',
      description: 'Signing in with a wrong password is refused and the account stays active.',
      precondition: account,
    },
    {
      id: 'SC-007',
      req: 'REQ-014',
      title: 'Lock on the 5th failed login in a row',
      type: 'negative',
      priority: 'high',
      description:
        'The account locks when the 5th wrong password in a row is entered, not on the 4th and not on the 6th.',
      precondition: account,
      testData: [
        { label: 'Email', value: 'test.user@shop.com' },
        { label: 'Wrong password', value: 'Wrong#123' },
        { label: 'Correct password', value: 'Correct#456' },
      ],
    },
    {
      id: 'SC-008',
      req: 'REQ-014',
      title: 'Unlock automatically after 15 minutes',
      type: 'positive',
      priority: 'medium',
      description:
        'A locked account signs in again with the right password once 15 minutes have passed.',
      precondition: 'The account was locked by 5 failed logins.',
    },
    {
      id: 'SC-009',
      req: 'REQ-014',
      title: 'Email a reset link when the account locks',
      type: 'positive',
      priority: 'low',
      description:
        'When the account locks, the owner gets an email with a link to reset the password.',
      status: 'pending-review',
      assignee: 'batool-hani',
      due: 3,
      editedBy: 'batool-mahmoud',
    },
    {
      id: 'SC-010',
      req: 'REQ-019',
      title: 'Pay for an order by credit card',
      type: 'positive',
      priority: 'high',
      description: 'A shopper pays for an order with a valid credit card and gets an order number.',
      precondition: 'The cart has at least one item.',
    },
    {
      id: 'SC-011',
      req: 'REQ-019',
      title: 'Choose cash on delivery at checkout',
      type: 'positive',
      priority: 'medium',
      description: 'A shopper chooses cash on delivery at checkout on any screen size.',
      precondition: 'The cart has at least one item.',
    },
    {
      id: 'SC-012',
      req: 'REQ-005',
      title: 'Update the cart total when the quantity changes',
      type: 'positive',
      priority: 'high',
      description:
        'Changing an item’s quantity updates the line total and the cart total straight away.',
      precondition: 'The cart has at least one item.',
    },
    {
      id: 'SC-013',
      req: 'REQ-026',
      title: 'Refuse an expired discount code',
      type: 'negative',
      priority: 'low',
      description:
        'A discount code past its end date is refused at checkout and the total doesn’t change.',
      precondition: 'The cart has at least one item.',
    },
  ];
  return specs.map((spec) => build(t, ECOM, 'batool-hani', t.daysAgo(3, 15, 22), spec));
}

function clinic(t: Clock) {
  const patient = 'A registered patient is signed in.';
  const specs: Spec[] = [
    {
      id: 'SC-001',
      req: 'REQ-001',
      title: 'Book a free slot with a doctor',
      type: 'positive',
      priority: 'high',
      description: 'A patient picks a doctor and a free slot, and the booking is confirmed.',
      precondition: patient,
    },
    {
      id: 'SC-002',
      req: 'REQ-006',
      title: 'Refuse a slot someone else just booked',
      type: 'negative',
      priority: 'critical',
      description: 'Two patients try the same slot; only the first booking goes through.',
      precondition: patient,
    },
    {
      id: 'SC-003',
      req: 'REQ-003',
      title: 'Cancel more than 24 hours before',
      type: 'positive',
      priority: 'medium',
      description: 'A patient cancels an appointment that starts in more than 24 hours.',
      precondition: 'The patient has an appointment in 3 days.',
    },
    {
      id: 'SC-004',
      req: 'REQ-003',
      title: 'Refuse a cancellation inside 24 hours',
      type: 'negative',
      priority: 'medium',
      description:
        'Cancelling an appointment that starts in less than 24 hours is refused with the clinic’s phone number.',
      precondition: 'The patient has an appointment tomorrow morning.',
    },
    {
      id: 'SC-005',
      req: 'REQ-004',
      title: 'Send the reminder at 18:00 the day before',
      type: 'positive',
      priority: 'medium',
      description: 'The reminder SMS goes out at 18:00 the day before the appointment.',
    },
    {
      id: 'SC-006',
      req: 'REQ-009',
      title: 'Move an appointment to another free slot',
      type: 'positive',
      priority: null,
      description: 'A patient moves an appointment to another free slot with the same doctor.',
      status: 'pending-review',
    },
  ];
  return specs.map((spec) => build(t, CLINIC, 'batool-mahmoud', t.daysAgo(26), spec));
}

function payments(t: Clock) {
  const specs: Spec[] = [
    {
      id: 'SC-001',
      req: 'REQ-001',
      title: 'Charge a saved card',
      type: 'positive',
      priority: 'critical',
      description: 'A charge request with a saved card succeeds and returns a payment ID.',
    },
    {
      id: 'SC-002',
      req: 'REQ-002',
      title: 'Ignore a repeated charge request',
      type: 'negative',
      priority: 'critical',
      description: 'Sending the same charge twice for one order charges the card once.',
    },
    {
      id: 'SC-003',
      req: 'REQ-006',
      title: 'Refund part of a payment',
      type: 'positive',
      priority: 'high',
      description: 'A refund for part of a payment, down to the fils, succeeds.',
    },
    {
      id: 'SC-004',
      req: 'REQ-003',
      title: 'Leave expired cards out of the list',
      type: 'negative',
      priority: 'medium',
      description: 'Expired cards are missing from the saved card list.',
    },
    {
      id: 'SC-005',
      req: 'REQ-008',
      title: 'Explain a payment timeout',
      type: 'negative',
      priority: 'high',
      description: 'A timed-out payment returns a message a shopper can act on.',
    },
  ];
  return specs.map((spec) => build(t, PAY, 'batool-mahmoud', t.daysAgo(55), spec));
}

function library(t: Clock) {
  const member = 'A member with no loans is registered.';
  const specs: Spec[] = [
    {
      id: 'SC-001',
      req: 'REQ-001',
      title: 'Find a book by its author',
      type: 'positive',
      priority: 'high',
      description: 'Searching an author’s name lists that author’s books.',
    },
    {
      id: 'SC-002',
      req: 'REQ-002',
      title: 'Borrow an available book',
      type: 'positive',
      priority: 'high',
      description: 'A member borrows an available book and its due date is 14 days later.',
      precondition: member,
    },
    {
      id: 'SC-003',
      req: 'REQ-003',
      title: 'Refuse a 4th loan',
      type: 'negative',
      priority: 'medium',
      description: 'A member with 3 books out can’t borrow a 4th.',
      precondition: 'A member has 3 books out.',
    },
    {
      id: 'SC-004',
      req: 'REQ-005',
      title: 'Charge a fine for a late return',
      type: 'positive',
      priority: 'medium',
      description: 'Returning a book 4 days late charges a 1.00 JOD fine.',
    },
    {
      id: 'SC-005',
      req: 'REQ-007',
      title: 'Reserve a book that is on loan',
      type: 'positive',
      priority: null,
      description: 'A member reserves a book that someone else has borrowed.',
      status: 'pending-review',
    },
  ];
  return specs.map((spec) => build(t, LIB, 'batool-hani', t.daysAgo(22), spec));
}

export function scenarios(t: Clock): ScenarioRecord[] {
  return [...ecommerce(t), ...clinic(t), ...payments(t), ...library(t)];
}
