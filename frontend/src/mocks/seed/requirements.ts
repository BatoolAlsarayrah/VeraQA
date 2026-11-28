import type { Finding, Priority, ReviewStatus } from '@/types';

import type { EventRecord, RequirementRecord, SrsFileRecord } from '../db';
import type { Clock } from './clock';
import { CLINIC, ECOM, LIB, PAY } from './projects';

type Spec = {
  id: string;
  section: string;
  title: string;
  text: string;
  status?: ReviewStatus;
  priority?: Priority | null;
  nonFunctional?: boolean;
  page?: number;
  confidence?: number;
  findings?: Finding[];
  rewrite?: string;
  reason?: string;
  assignee?: string;
  due?: number;
};

type Context = {
  projectId: string;
  file: string | null;
  decider: string;
  draftedAt: string;
  decidedAt: string;
};

function build(t: Clock, context: Context, spec: Spec): RequirementRecord {
  const status = spec.status ?? 'approved';
  const decided = status !== 'pending-review';
  const history: EventRecord[] = [
    {
      at: context.draftedAt,
      actor: context.file ? { type: 'ai' } : { type: 'person', id: context.decider },
      action: context.file ? 'drafted' : 'created',
      note: null,
    },
  ];
  if (decided) {
    history.push({
      at: context.decidedAt,
      actor: { type: 'person', id: context.decider },
      action: status === 'approved' ? 'approved' : 'rejected',
      note: spec.reason ?? null,
    });
  }
  return {
    projectId: context.projectId,
    id: spec.id,
    title: spec.title,
    text: spec.text,
    section: spec.section,
    type: spec.nonFunctional ? 'non-functional' : 'functional',
    status,
    priority: spec.priority === undefined ? (decided ? 'medium' : null) : spec.priority,
    origin: context.file ? 'ai' : 'person',
    confidence: context.file ? (spec.confidence ?? 0.9) : null,
    source: {
      file: context.file,
      section: context.file ? spec.section : null,
      page: spec.page ?? null,
    },
    findings: spec.findings ?? [],
    rewrite: spec.rewrite ?? null,
    rejectionReason: spec.reason ?? null,
    decidedBy: decided ? context.decider : null,
    decidedAt: decided ? context.decidedAt : null,
    assigneeId: spec.assignee ?? null,
    due: spec.due === undefined ? null : t.day(spec.due),
    history,
  };
}

function ecommerce(t: Clock) {
  const context: Context = {
    projectId: ECOM,
    file: 'SRS_v2.pdf',
    decider: 'batool-hani',
    draftedAt: t.ago(70),
    decidedAt: t.ago(30),
  };
  const specs: Spec[] = [
    {
      id: 'REQ-001',
      section: 'Catalog',
      title: 'Browse products by category',
      text: 'Users shall be able to browse products by category.',
      page: 3,
      priority: 'medium',
    },
    {
      id: 'REQ-002',
      section: 'Catalog',
      title: 'Search products by name',
      text: 'Users shall be able to search products by name.',
      page: 3,
      priority: 'medium',
    },
    {
      id: 'REQ-003',
      section: 'Catalog',
      title: 'Show price and stock on the product page',
      text: 'The system shall show the price and the stock level on every product page.',
      page: 4,
      priority: 'low',
    },
    {
      id: 'REQ-004',
      section: 'Cart',
      title: 'Add a product to the cart',
      text: 'Users shall be able to add a product to the cart from the product page.',
      page: 4,
      priority: 'high',
    },
    {
      id: 'REQ-005',
      section: 'Cart',
      title: 'Update the cart total when the quantity changes',
      text: 'The system shall update the cart total when the quantity of an item changes.',
      page: 5,
      priority: 'high',
    },
    {
      id: 'REQ-006',
      section: 'Cart',
      title: 'Remove an item from the cart',
      text: 'Users shall be able to remove an item from the cart.',
      page: 5,
      priority: 'medium',
    },
    {
      id: 'REQ-007',
      section: 'Cart',
      title: 'Keep the cart between visits',
      text: 'The system shall keep the cart for signed-in users between visits.',
      page: 5,
      priority: 'low',
    },
    {
      id: 'REQ-008',
      section: 'Authentication',
      title: 'Sign out from any page',
      text: 'Users shall be able to sign out from any page.',
      page: 6,
      priority: 'low',
    },
    {
      id: 'REQ-009',
      section: 'Authentication',
      title: 'Keep the session for 30 days with Remember me',
      text: 'The system shall keep the session for 30 days when Remember me is checked.',
      page: 6,
      priority: 'low',
      findings: [
        {
          n: 1,
          kind: 'missing-information',
          text: 'It doesn’t say what happens to the session after a password change.',
          related: null,
          resolved: true,
        },
      ],
    },
    {
      id: 'REQ-010',
      section: 'Authentication',
      title: 'Sign in with an email and password',
      text: 'Users shall be able to sign in with their email address and password.',
      page: 6,
      priority: 'high',
    },
    {
      id: 'REQ-011',
      section: 'Accounts',
      title: 'Register with an email address and password',
      text: 'Users shall be able to register with an email address and password.',
      page: 2,
      priority: 'high',
      confidence: 0.95,
    },
    {
      id: 'REQ-012',
      section: 'Security',
      title: 'Store passwords securely',
      text: 'Passwords shall be stored securely.',
      status: 'pending-review',
      nonFunctional: true,
      page: 11,
      confidence: 0.92,
      priority: null,
    },
    {
      id: 'REQ-013',
      section: 'Accounts',
      title: 'Send a confirmation email within 2 minutes',
      text: 'The system shall send a confirmation email within 2 minutes of registration.',
      page: 2,
      priority: 'high',
      findings: [
        {
          n: 1,
          kind: 'ambiguous',
          text: '“Quickly” has no measure. Say how fast the email must arrive.',
          related: null,
          resolved: true,
        },
      ],
    },
    {
      id: 'REQ-014',
      section: 'Authentication',
      title: 'Lock the account for 15 minutes after 5 failed logins',
      text: 'The system shall lock the account for 15 minutes after 5 consecutive failed logins.',
      page: 7,
      priority: 'high',
      confidence: 0.94,
    },
    {
      id: 'REQ-015',
      section: 'Authentication',
      title: 'Reset the password at any time',
      text: 'Users shall be able to reset their password at any time.',
      status: 'pending-review',
      page: 7,
      confidence: 0.86,
      priority: null,
      assignee: 'batool-hani',
      due: 0,
      findings: [
        {
          n: 1,
          kind: 'missing-information',
          text: 'How the reset link is delivered, and how long it stays valid, isn’t defined.',
          related: null,
          resolved: false,
        },
        {
          n: 2,
          kind: 'ambiguous',
          text: '“At any time” has no limits. Say when a reset isn’t allowed.',
          related: null,
          resolved: false,
        },
        {
          n: 3,
          kind: 'contradiction',
          text: 'REQ-014 locks the account for 15 minutes, but a reset at any time would defeat the lockout.',
          related: 'REQ-014',
          resolved: false,
        },
      ],
      rewrite:
        'Users shall be able to reset their password through an emailed link that stays valid for 1 hour, except during an active lockout.',
    },
    {
      id: 'REQ-016',
      section: 'Admin',
      title: 'Load the admin dashboard within 2 seconds',
      text: 'The admin dashboard shall load within 2 seconds.',
      nonFunctional: true,
      page: 12,
      priority: 'medium',
      findings: [
        {
          n: 1,
          kind: 'ambiguous',
          text: '“Fast” has no measure. Say how long loading may take.',
          related: null,
          resolved: true,
        },
      ],
    },
    {
      id: 'REQ-017',
      section: 'Orders',
      title: 'Email a receipt after every payment',
      text: 'The system shall email a receipt after every payment.',
      page: 9,
      priority: 'medium',
    },
    {
      id: 'REQ-018',
      section: 'Checkout',
      title: 'Update the cart quickly',
      text: 'The cart shall update quickly when an item is added.',
      status: 'pending-review',
      nonFunctional: true,
      page: 8,
      confidence: 0.81,
      priority: null,
      assignee: 'batool-hani',
      due: 0,
      findings: [
        {
          n: 1,
          kind: 'ambiguous',
          text: '“Quickly” has no measure. Say how fast it must update.',
          related: null,
          resolved: false,
        },
      ],
      rewrite: 'The cart shall update within 1 second when an item is added.',
    },
    {
      id: 'REQ-019',
      section: 'Checkout',
      title: 'Pay by credit card or cash on delivery',
      text: 'Users shall be able to pay by credit card or cash on delivery.',
      page: 8,
      priority: 'high',
    },
    {
      id: 'REQ-020',
      section: 'Checkout',
      title: 'Apply discount codes at checkout',
      text: 'The system shall apply discount codes at checkout.',
      status: 'pending-review',
      page: 8,
      priority: null,
      assignee: 'batool-hani',
      due: 1,
    },
    {
      id: 'REQ-021',
      section: 'General',
      title: 'Be easy to use',
      text: 'The system shall be easy to use.',
      nonFunctional: true,
      page: 13,
      confidence: 0.62,
      priority: 'low',
    },
    {
      id: 'REQ-022',
      section: 'Admin',
      title: 'Load reports fast',
      text: 'Reports shall load fast.',
      nonFunctional: true,
      page: 12,
      confidence: 0.64,
      priority: 'low',
    },
    {
      id: 'REQ-023',
      section: 'Orders',
      title: 'Send an order confirmation by email',
      text: 'The system shall send an order confirmation by email.',
      status: 'pending-review',
      page: 9,
      priority: null,
    },
    {
      id: 'REQ-024',
      section: 'Checkout',
      title: 'Apply free shipping to orders over 50 JOD',
      text: 'The system shall apply free shipping to orders over 50 JOD.',
      page: 10,
      priority: 'medium',
      findings: [
        {
          n: 1,
          kind: 'contradiction',
          text: 'REQ-026 adds a delivery fee to every order, which conflicts with free shipping.',
          related: 'REQ-026',
          resolved: true,
        },
      ],
    },
    {
      id: 'REQ-025',
      section: 'Orders',
      title: 'Show the order history for the last 12 months',
      text: 'Users shall be able to see their order history for the last 12 months.',
      page: 9,
      priority: 'low',
    },
    {
      id: 'REQ-026',
      section: 'Checkout',
      title: 'Refuse expired discount codes',
      text: 'The system shall refuse expired discount codes at checkout.',
      page: 10,
      priority: 'low',
    },
  ];
  return specs.map((spec) => build(t, context, spec));
}

function clinic(t: Clock) {
  const context: Context = {
    projectId: CLINIC,
    file: 'Clinic_SRS.docx',
    decider: 'batool-mahmoud',
    draftedAt: t.daysAgo(30),
    decidedAt: t.daysAgo(28),
  };
  const specs: Spec[] = [
    {
      id: 'REQ-001',
      section: 'Booking',
      title: 'Book an appointment with a doctor',
      text: 'Patients shall be able to book an appointment with a doctor of their choice.',
      priority: 'high',
    },
    {
      id: 'REQ-002',
      section: 'Booking',
      title: 'Show free slots for the next 14 days',
      text: 'The system shall show each doctor’s free slots for the next 14 days.',
      priority: 'high',
    },
    {
      id: 'REQ-003',
      section: 'Booking',
      title: 'Cancel an appointment up to 24 hours before',
      text: 'Patients shall be able to cancel an appointment up to 24 hours before it starts.',
      priority: 'medium',
    },
    {
      id: 'REQ-004',
      section: 'Reminders',
      title: 'Send a reminder SMS the day before',
      text: 'The system shall send a reminder SMS at 18:00 the day before an appointment.',
      priority: 'medium',
    },
    {
      id: 'REQ-005',
      section: 'Schedules',
      title: 'Block a slot when a doctor is away',
      text: 'Doctors shall be able to block slots when they are away.',
      priority: 'medium',
    },
    {
      id: 'REQ-006',
      section: 'Schedules',
      title: 'Prevent double booking of a slot',
      text: 'The system shall prevent two patients from booking the same slot.',
      priority: 'critical',
    },
    {
      id: 'REQ-007',
      section: 'Accounts',
      title: 'Sign in with a phone number',
      text: 'Patients shall be able to sign in with their phone number and a one-time code.',
      priority: 'high',
    },
    {
      id: 'REQ-008',
      section: 'Accounts',
      title: 'Keep patient records private',
      text: 'The system shall show a patient’s records only to that patient and their doctors.',
      nonFunctional: true,
      priority: 'critical',
    },
    {
      id: 'REQ-009',
      section: 'Booking',
      title: 'Reschedule an appointment',
      text: 'Patients shall be able to move an appointment to another free slot.',
      priority: 'medium',
    },
    {
      id: 'REQ-010',
      section: 'Reports',
      title: 'Show daily appointments to reception',
      text: 'The system shall show reception a list of the day’s appointments.',
      priority: 'low',
    },
    {
      id: 'REQ-011',
      section: 'Reminders',
      title: 'Let patients turn reminders off',
      text: 'Patients shall be able to turn appointment reminders off.',
      status: 'pending-review',
      priority: null,
    },
    {
      id: 'REQ-012',
      section: 'General',
      title: 'Work well on all devices',
      text: 'The system shall work well on all devices.',
      status: 'rejected',
      nonFunctional: true,
      confidence: 0.58,
      priority: null,
      reason: 'Too broad to test. Split it into the browsers and screen sizes we support.',
    },
  ];
  return specs.map((spec) => build(t, context, spec));
}

function payments(t: Clock) {
  const context: Context = {
    projectId: PAY,
    file: 'Payments_API_spec.pdf',
    decider: 'batool-mahmoud',
    draftedAt: t.daysAgo(60),
    decidedAt: t.daysAgo(58),
  };
  const specs: Spec[] = [
    {
      id: 'REQ-001',
      section: 'Cards',
      title: 'Charge a saved card',
      text: 'The API shall charge a saved card with a single request.',
      priority: 'critical',
    },
    {
      id: 'REQ-002',
      section: 'Cards',
      title: 'Charge a card only once per order',
      text: 'The API shall charge a card only once for the same order, even if the request is repeated.',
      priority: 'critical',
    },
    {
      id: 'REQ-003',
      section: 'Cards',
      title: 'Hide expired saved cards',
      text: 'The API shall leave expired cards out of the saved card list.',
      priority: 'medium',
    },
    {
      id: 'REQ-004',
      section: 'Wallet',
      title: 'Top up the wallet',
      text: 'Users shall be able to top up their wallet from a saved card.',
      priority: 'high',
    },
    {
      id: 'REQ-005',
      section: 'Wallet',
      title: 'Show the new balance after a top-up',
      text: 'The API shall return the new wallet balance after every top-up.',
      priority: 'medium',
    },
    {
      id: 'REQ-006',
      section: 'Refunds',
      title: 'Refund part of a payment',
      text: 'The API shall refund any amount up to the original payment, in fils.',
      priority: 'high',
    },
    {
      id: 'REQ-007',
      section: 'Refunds',
      title: 'Email the refunded amount',
      text: 'The system shall email the customer the refunded amount.',
      priority: 'low',
    },
    {
      id: 'REQ-008',
      section: 'Errors',
      title: 'Explain a payment timeout',
      text: 'The API shall return a clear message when a payment times out.',
      priority: 'high',
    },
  ];
  return specs.map((spec) => build(t, context, spec));
}

function library(t: Clock) {
  const context: Context = {
    projectId: LIB,
    file: null,
    decider: 'batool-hani',
    draftedAt: t.daysAgo(25),
    decidedAt: t.daysAgo(24),
  };
  const specs: Spec[] = [
    {
      id: 'REQ-001',
      section: 'Catalog',
      title: 'Search books by title or author',
      text: 'Members shall be able to search books by title or author.',
      priority: 'high',
    },
    {
      id: 'REQ-002',
      section: 'Loans',
      title: 'Borrow a book',
      text: 'Members shall be able to borrow an available book for 14 days.',
      priority: 'high',
    },
    {
      id: 'REQ-003',
      section: 'Loans',
      title: 'Limit members to 3 loans',
      text: 'The system shall refuse a 4th loan while a member has 3 books out.',
      priority: 'medium',
    },
    {
      id: 'REQ-004',
      section: 'Loans',
      title: 'Return a book',
      text: 'Librarians shall be able to record a returned book.',
      priority: 'high',
    },
    {
      id: 'REQ-005',
      section: 'Fines',
      title: 'Charge a fine for late returns',
      text: 'The system shall charge 0.25 JOD for each day a book is late.',
      priority: 'medium',
    },
    {
      id: 'REQ-006',
      section: 'Accounts',
      title: 'Register a new member',
      text: 'Librarians shall be able to register a new member with a student ID.',
      priority: 'medium',
    },
    {
      id: 'REQ-007',
      section: 'Loans',
      title: 'Reserve a book that is out',
      text: 'Members shall be able to reserve a book that is on loan.',
      priority: 'low',
    },
    {
      id: 'REQ-008',
      section: 'Reports',
      title: 'List overdue books',
      text: 'The system shall list every overdue book with its member.',
      priority: 'low',
    },
    {
      id: 'REQ-009',
      section: 'Fines',
      title: 'Waive a fine',
      text: 'Librarians shall be able to waive a fine with a reason.',
      status: 'pending-review',
      priority: null,
    },
    {
      id: 'REQ-010',
      section: 'General',
      title: 'Look modern',
      text: 'The system shall look modern.',
      status: 'rejected',
      nonFunctional: true,
      priority: null,
      reason: 'Not testable. The look is covered by the course style guide.',
    },
  ];
  return specs.map((spec) => build(t, context, spec));
}

export function requirements(t: Clock): RequirementRecord[] {
  return [...ecommerce(t), ...clinic(t), ...payments(t), ...library(t)];
}

export function files(t: Clock): SrsFileRecord[] {
  return [
    { projectId: ECOM, name: 'SRS_v2.pdf', size: 1_258_291, pages: 18, uploadedAt: t.ago(72) },
    { projectId: ECOM, name: 'NFR_addendum.docx', size: 245_760, pages: 4, uploadedAt: t.ago(72) },
    {
      projectId: CLINIC,
      name: 'Clinic_SRS.docx',
      size: 412_000,
      pages: 9,
      uploadedAt: t.daysAgo(30),
    },
    {
      projectId: PAY,
      name: 'Payments_API_spec.pdf',
      size: 880_000,
      pages: 14,
      uploadedAt: t.daysAgo(60),
    },
  ];
}
