import type { Priority, ReviewStatus, TestCaseType, TestDataItem } from '@/types';

import type { TestCaseRecord } from '../db';
import type { Clock } from './clock';
import { CLINIC, ECOM, LIB, PAY } from './projects';

type Spec = [
  id: string,
  scenario: string,
  title: string,
  type: TestCaseType,
  priority: Priority,
  steps: [action: string, expected: string][],
  options?: {
    status?: ReviewStatus;
    precondition?: string;
    testData?: TestDataItem[];
    assignee?: string;
    due?: number;
  },
];

const login: TestDataItem[] = [
  { label: 'Email', value: 'test.user@shop.com' },
  { label: 'Wrong password', value: 'Wrong#123' },
  { label: 'Correct password', value: 'Correct#456' },
];
const visa: TestDataItem[] = [
  { label: 'Card', value: '4111 1111 1111 1111' },
  { label: 'Expiry', value: '12/27' },
  { label: 'CVC', value: '123' },
];
const account = { precondition: 'An active account exists.', testData: login };
const signIn: [string, string] = ['Open the sign-in page.', 'the sign-in form appears.'];
const register: [string, string] = [
  'Open the registration page.',
  'the registration form appears.',
];
const checkout: [string, string] = [
  'Go to checkout and choose Credit card.',
  'the card form appears.',
];

const ecommerce: Spec[] = [
  [
    'TC-001',
    'SC-001',
    'Register with a new email',
    'normal',
    'high',
    [
      register,
      ['Enter a new email address and a valid password.', 'the account is created.'],
      ['Sign in with the new account.', 'sign-in works.'],
    ],
  ],
  [
    'TC-002',
    'SC-001',
    'Refuse a password shorter than 8 characters',
    'wrong-input',
    'high',
    [
      register,
      ['Enter a 7-character password and submit.', 'the form shows “Use at least 8 characters”.'],
      ['Check the user list.', 'no account was created.'],
    ],
  ],
  [
    'TC-003',
    'SC-001',
    'Refuse a password without a number',
    'wrong-input',
    'medium',
    [
      register,
      ['Enter “Password” as the password and submit.', 'the form shows “Add at least one number”.'],
    ],
  ],
  [
    'TC-004',
    'SC-001',
    'Accept a 64-character password',
    'limit',
    'low',
    [register, ['Enter a 64-character password and submit.', 'the account is created.']],
  ],
  [
    'TC-005',
    'SC-003',
    'Confirmation email arrives within 2 minutes',
    'normal',
    'high',
    [
      ['Register with a new email address.', 'the account is created.'],
      ['Check the inbox for 2 minutes.', 'the confirmation email arrives.'],
    ],
  ],
  [
    'TC-006',
    'SC-003',
    'Open the account from the confirmation link',
    'normal',
    'medium',
    [
      [
        'Open the link in the confirmation email.',
        'the account page opens and says the email is confirmed.',
      ],
    ],
  ],
  [
    'TC-007',
    'SC-005',
    'Sign in with the right email and password',
    'normal',
    'high',
    [signIn, ['Enter the right email and password.', 'the account page opens.']],
    account,
  ],
  [
    'TC-008',
    'SC-005',
    'Fit the sign-in page on a 360px screen',
    'limit',
    'low',
    [
      [
        'Open the sign-in page on a screen 360px wide.',
        'the logo and the sign-in button don’t overlap.',
      ],
    ],
  ],
  [
    'TC-009',
    'SC-005',
    'Keep the session for 30 days with Remember me',
    'normal',
    'low',
    [
      ['Sign in with Remember me checked.', 'the account page opens.'],
      ['Come back 29 days later.', 'the account is still signed in.'],
    ],
    account,
  ],
  [
    'TC-010',
    'SC-005',
    'Sign out from the account menu',
    'normal',
    'low',
    [
      ['Open the account menu and choose Sign out.', 'the sign-in page opens.'],
      ['Press Back in the browser.', 'the account page doesn’t open.'],
    ],
    account,
  ],
  [
    'TC-011',
    'SC-006',
    'Offer a reset link after a wrong password',
    'normal',
    'medium',
    [
      [
        'Sign in with a wrong password.',
        '“Incorrect password” appears with a Reset password link.',
      ],
      ['Choose Reset password.', 'the reset email arrives with no spelling mistakes.'],
    ],
    account,
  ],
  [
    'TC-012',
    'SC-006',
    'Refuse an unknown email',
    'wrong-input',
    'medium',
    [['Sign in with an email that has no account.', '“Incorrect email or password” appears.']],
  ],
  [
    'TC-013',
    'SC-006',
    'Keep the account active after 4 wrong passwords',
    'limit',
    'medium',
    [
      ['Sign in with the wrong password 4 times.', '“Incorrect password” each time.'],
      ['Sign in with the correct password.', 'sign-in works.'],
    ],
    account,
  ],
  [
    'TC-014',
    'SC-005',
    'Sign in with the email in capitals',
    'wrong-input',
    'low',
    [['Enter the email in capitals with the right password.', 'sign-in works.']],
    account,
  ],
  [
    'TC-031',
    'SC-007',
    'Lock the account after 5 consecutive failed logins',
    'limit',
    'high',
    [
      signIn,
      [
        'Sign in with the wrong password 4 times.',
        '“Incorrect password” each time, and the account stays active.',
      ],
      ['Sign in with the wrong password a 5th time.', 'the account locks for 15 minutes.'],
      ['Sign in with the correct password.', 'sign-in is refused while locked.'],
    ],
    account,
  ],
  [
    'TC-032',
    'SC-007',
    'Reset the failed-attempt count after a successful sign-in',
    'normal',
    'high',
    [
      signIn,
      [
        'Sign in with the wrong password 4 times.',
        '“Incorrect password” each time, and the account stays active.',
      ],
      [
        'Sign in with the correct password.',
        'sign-in works, and the failed-attempt count goes back to 0.',
      ],
      [
        'Sign out, then sign in with the wrong password once.',
        '“Incorrect password”, and the account stays active.',
      ],
    ],
    account,
  ],
  [
    'TC-033',
    'SC-008',
    'Allow sign-in exactly 15 minutes after the lock',
    'limit',
    'medium',
    [
      ['Sign in with the wrong password 5 times.', 'the account locks for 15 minutes.'],
      ['Wait 14 minutes, then sign in with the correct password.', 'sign-in is still refused.'],
      ['Wait 1 more minute, then sign in with the correct password.', 'sign-in works.'],
    ],
    account,
  ],
  [
    'TC-034',
    'SC-007',
    'Count only failed logins in a row',
    'wrong-input',
    'medium',
    [
      ['Sign in with the wrong password 3 times.', 'the account stays active.'],
      ['Sign in with the correct password, then sign out.', 'sign-in works.'],
      ['Sign in with the wrong password 4 times.', 'the account stays active.'],
    ],
    account,
  ],
  [
    'TC-035',
    'SC-008',
    'Keep the lock for the full 15 minutes',
    'limit',
    'medium',
    [
      ['Lock the account with 5 wrong passwords.', 'the account locks.'],
      ['Wait 10 minutes, then sign in with the correct password.', 'sign-in is still refused.'],
    ],
    account,
  ],
  [
    'TC-037',
    'SC-010',
    'Pay with a Mastercard',
    'normal',
    'medium',
    [
      checkout,
      ['Enter a valid Mastercard and pay.', 'the confirmation page shows an order number.'],
    ],
  ],
  [
    'TC-038',
    'SC-010',
    'Refuse a wrong security code',
    'wrong-input',
    'medium',
    [
      checkout,
      [
        'Enter a valid card with a wrong security code and pay.',
        '“Check the security code” appears and nothing is charged.',
      ],
    ],
  ],
  [
    'TC-039',
    'SC-010',
    'Pay with a card number typed with spaces',
    'wrong-input',
    'high',
    [
      checkout,
      ['Enter the card number with spaces, like 4111 1111 1111 1111.', 'the number is accepted.'],
      ['Pay.', 'the confirmation page shows an order number.'],
    ],
    { testData: visa },
  ],
  [
    'TC-040',
    'SC-010',
    'Pay with a valid Visa card',
    'normal',
    'high',
    [
      checkout,
      [
        'Enter the Visa card from the test data and pay.',
        'the confirmation page shows an order number.',
      ],
      ['Open My orders.', 'the order is listed as Paid.'],
    ],
    { precondition: 'The cart has at least one item.', testData: visa },
  ],
  [
    'TC-041',
    'SC-010',
    'Show the order number on the confirmation page',
    'normal',
    'medium',
    [
      ['Pay for an order by card.', 'the confirmation page opens.'],
      ['Read the confirmation page.', 'it shows the order number.'],
    ],
  ],
  [
    'TC-042',
    'SC-010',
    'Refuse an expired card',
    'wrong-input',
    'medium',
    [
      checkout,
      ['Enter a card that expired last month and pay.', '“This card has expired” appears.'],
    ],
  ],
  [
    'TC-043',
    'SC-010',
    'Charge exactly the order total',
    'limit',
    'low',
    [['Pay for an order of 49.995 JOD.', 'the card is charged 49.995 JOD, with no rounding.']],
  ],
  [
    'TC-044',
    'SC-011',
    'Choose cash on delivery on mobile',
    'normal',
    'medium',
    [
      ['Open checkout on a phone.', 'the payment options appear.'],
      ['Choose Cash on delivery.', 'it’s selected and Place order works.'],
    ],
  ],
  [
    'TC-045',
    'SC-011',
    'Show cash on delivery on the desktop checkout',
    'normal',
    'medium',
    [['Open checkout in a desktop browser.', 'Cash on delivery is listed next to Credit card.']],
    { status: 'pending-review', assignee: 'batool-hani', due: 3 },
  ],
  [
    'TC-046',
    'SC-011',
    'Hide cash on delivery for orders over 500 JOD',
    'limit',
    'low',
    [['Open checkout with an order of 501 JOD.', 'Cash on delivery isn’t offered.']],
  ],
  [
    'TC-047',
    'SC-012',
    'Update the total when the quantity changes',
    'normal',
    'high',
    [
      ['Add an item to the cart.', 'the cart shows the item and its total.'],
      ['Change the quantity to 3.', 'the line total and the cart total update straight away.'],
    ],
  ],
  [
    'TC-048',
    'SC-012',
    'Remove an item from the cart',
    'normal',
    'medium',
    [['Remove an item from the cart.', 'the item disappears and the total goes down.']],
  ],
  [
    'TC-049',
    'SC-012',
    'Keep quantities after a page reload',
    'normal',
    'low',
    [['Set a quantity to 2 and reload the page.', 'the quantity is still 2.']],
  ],
  [
    'TC-050',
    'SC-013',
    'Refuse a code that doesn’t exist',
    'wrong-input',
    'low',
    [['Enter “NOPE10” as the discount code.', '“This code doesn’t exist” appears.']],
  ],
  [
    'TC-051',
    'SC-013',
    'Accept a code on its last valid day',
    'limit',
    'low',
    [['Enter a code that ends today.', 'the discount is applied.']],
  ],
  [
    'TC-052',
    'SC-013',
    'Refuse an expired discount code at checkout',
    'normal',
    'low',
    [
      [
        'Enter a code that ended yesterday.',
        '“This code has expired” appears and the total doesn’t change.',
      ],
    ],
  ],
];

const patient = { precondition: 'A registered patient is signed in.' };
const clinic: Spec[] = [
  [
    'TC-001',
    'SC-001',
    'Book the first free slot of the day',
    'normal',
    'high',
    [
      ['Choose a doctor and tomorrow’s first free slot.', 'the slot is offered.'],
      ['Confirm the booking.', 'the booking is confirmed by SMS.'],
    ],
    patient,
  ],
  [
    'TC-002',
    'SC-001',
    'Book the last slot of the day',
    'limit',
    'medium',
    [
      ['Choose a doctor and the 16:30 slot.', 'the slot is offered.'],
      ['Confirm the booking.', 'the booking is confirmed.'],
    ],
    patient,
  ],
  [
    'TC-003',
    'SC-001',
    'Refuse a booking in the past',
    'wrong-input',
    'medium',
    [['Open yesterday’s slots.', 'no slot can be chosen.']],
    patient,
  ],
  [
    'TC-004',
    'SC-002',
    'Refuse a slot booked a second earlier',
    'wrong-input',
    'critical',
    [
      ['Open the same slot as two patients.', 'both see it as free.'],
      ['Confirm as the first patient, then as the second.', 'only the first booking goes through.'],
    ],
    patient,
  ],
  [
    'TC-005',
    'SC-002',
    'Show the slot as taken after booking',
    'normal',
    'high',
    [
      ['Book a slot.', 'the booking is confirmed.'],
      [
        'Open the same doctor’s slots as another patient.',
        'the slot is shown as taken and can’t be chosen.',
      ],
    ],
    patient,
  ],
  [
    'TC-006',
    'SC-003',
    'Cancel 3 days before',
    'normal',
    'medium',
    [
      [
        'Open an appointment 3 days away and choose Cancel.',
        'the appointment is cancelled and the slot is free again.',
      ],
    ],
    patient,
  ],
  [
    'TC-007',
    'SC-003',
    'Cancel exactly 24 hours before',
    'limit',
    'medium',
    [
      [
        'Open an appointment that starts in exactly 24 hours and choose Cancel.',
        'the appointment is cancelled.',
      ],
    ],
    patient,
  ],
  [
    'TC-008',
    'SC-004',
    'Refuse a cancellation 23 hours before',
    'limit',
    'medium',
    [['Open an appointment that starts in 23 hours and choose Cancel.', 'cancelling is refused.']],
    patient,
  ],
  [
    'TC-009',
    'SC-004',
    'Show the clinic’s phone number when refusing',
    'normal',
    'low',
    [
      ['Open an appointment tomorrow morning.', 'the appointment page opens.'],
      ['Choose Cancel.', 'the refusal shows the clinic’s phone number.'],
    ],
    patient,
  ],
  [
    'TC-010',
    'SC-005',
    'Send the reminder at 18:00',
    'normal',
    'medium',
    [
      ['Book an appointment for tomorrow.', 'the booking is confirmed.'],
      ['Wait until 18:00 today.', 'the reminder SMS arrives at 18:00.'],
    ],
  ],
  [
    'TC-011',
    'SC-005',
    'Send no reminder for a cancelled appointment',
    'wrong-input',
    'low',
    [['Cancel tomorrow’s appointment before 18:00.', 'no reminder SMS arrives.']],
  ],
  [
    'TC-012',
    'SC-005',
    'Send the reminder for a booking made at 17:59',
    'limit',
    'low',
    [['Book an appointment for tomorrow at 17:59.', 'the reminder SMS arrives at 18:00.']],
  ],
  [
    'TC-013',
    'SC-001',
    'Book an appointment on a phone',
    'normal',
    'medium',
    [
      ['Open the booking page on a phone.', 'the doctors and slots fit the screen.'],
      ['Book a free slot.', 'the booking is confirmed.'],
    ],
    patient,
  ],
  [
    'TC-014',
    'SC-005',
    'Send the reminder in Arabic for Arabic accounts',
    'normal',
    'low',
    [
      ['Book as a patient whose language is Arabic.', 'the booking is confirmed.'],
      ['Wait until 18:00.', 'the reminder SMS is in Arabic.'],
    ],
    { status: 'pending-review' },
  ],
];

const payments: Spec[] = [
  [
    'TC-001',
    'SC-001',
    'Charge a saved Visa card',
    'normal',
    'critical',
    [['Send a charge request with a saved Visa card.', 'the API answers 201 with a payment ID.']],
  ],
  [
    'TC-002',
    'SC-001',
    'Refuse a charge over the card limit',
    'wrong-input',
    'high',
    [
      [
        'Charge more than the test card’s limit.',
        'the API answers 402 with “The card was declined”.',
      ],
    ],
  ],
  [
    'TC-003',
    'SC-002',
    'Send the same charge twice within a second',
    'wrong-input',
    'critical',
    [
      [
        'Send the same charge request twice within a second.',
        'the card is charged once and both answers have the same payment ID.',
      ],
    ],
  ],
  [
    'TC-004',
    'SC-002',
    'Send the same charge again after a timeout',
    'limit',
    'high',
    [
      ['Send a charge that times out.', 'the API answers 504.'],
      ['Send the same charge again.', 'the card is charged once.'],
    ],
  ],
  [
    'TC-005',
    'SC-003',
    'Refund half of a payment',
    'normal',
    'high',
    [['Refund half of a 20.000 JOD payment.', 'the API refunds 10.000 JOD.']],
  ],
  [
    'TC-006',
    'SC-003',
    'Refund 0.125 JOD',
    'limit',
    'medium',
    [['Refund 0.125 JOD of a payment.', 'the API refunds exactly 0.125 JOD.']],
  ],
  [
    'TC-007',
    'SC-003',
    'Refuse a refund larger than the payment',
    'wrong-input',
    'medium',
    [['Refund 25.000 JOD of a 20.000 JOD payment.', 'the API answers 422 and refunds nothing.']],
  ],
  [
    'TC-008',
    'SC-004',
    'Leave out a card that expired last month',
    'normal',
    'medium',
    [
      [
        'List the saved cards of a customer with one expired card.',
        'the expired card isn’t in the list.',
      ],
    ],
  ],
  [
    'TC-009',
    'SC-005',
    'Return a clear message after 30 seconds',
    'normal',
    'high',
    [
      [
        'Charge a card that never answers.',
        'after 30 seconds the API answers with a message a shopper can act on.',
      ],
    ],
  ],
  [
    'TC-010',
    'SC-005',
    'Keep the order unpaid after a timeout',
    'wrong-input',
    'medium',
    [['Charge a card that never answers.', 'the order stays unpaid and nothing is charged.']],
  ],
];

const library: Spec[] = [
  [
    'TC-001',
    'SC-001',
    'Find books by an author’s last name',
    'normal',
    'high',
    [['Search for “Mahfouz”.', 'every book by Naguib Mahfouz is listed.']],
  ],
  [
    'TC-002',
    'SC-001',
    'Find nothing for an unknown author',
    'wrong-input',
    'low',
    [['Search for “Zzzz”.', '“No books match” appears.']],
  ],
  [
    'TC-003',
    'SC-002',
    'Borrow an available book',
    'normal',
    'high',
    [['Lend an available book to a member.', 'the book is marked as on loan.']],
  ],
  [
    'TC-004',
    'SC-002',
    'Set the due date 14 days ahead',
    'normal',
    'medium',
    [['Lend a book today.', 'its due date is 14 days from today.']],
  ],
  [
    'TC-005',
    'SC-003',
    'Refuse a 4th loan',
    'limit',
    'medium',
    [['Lend a 4th book to a member with 3 books out.', 'the loan is refused.']],
  ],
  [
    'TC-006',
    'SC-003',
    'Allow a 3rd loan',
    'limit',
    'medium',
    [['Lend a 3rd book to a member with 2 books out.', 'the loan goes through.']],
  ],
  [
    'TC-007',
    'SC-004',
    'Charge 1.00 JOD for 4 days late',
    'normal',
    'medium',
    [['Return a book 4 days after its due date.', 'a fine of 1.00 JOD is charged.']],
  ],
  [
    'TC-008',
    'SC-004',
    'Charge nothing on the due date',
    'limit',
    'medium',
    [['Return a book on its due date.', 'no fine is charged.']],
  ],
  [
    'TC-009',
    'SC-004',
    'Charge for a return 1 day late',
    'limit',
    'low',
    [['Return a book 1 day after its due date.', 'a fine of 0.25 JOD is charged.']],
  ],
];

function build(
  t: Clock,
  projectId: string,
  decider: string,
  draftedAt: string,
  spec: Spec,
): TestCaseRecord {
  const [id, scenarioId, title, type, priority, steps, options = {}] = spec;
  const status = options.status ?? 'approved';
  return {
    projectId,
    id,
    scenarioId,
    title,
    type,
    priority,
    status,
    origin: 'ai',
    precondition: options.precondition ?? null,
    testData: options.testData ?? [],
    steps: steps.map(([action, expected], index) => ({ n: index + 1, action, expected })),
    assigneeId: options.assignee ?? null,
    due: options.due === undefined ? null : t.day(options.due),
    rejectionReason: null,
    history: [
      { at: draftedAt, actor: { type: 'ai' }, action: 'drafted', note: null },
      ...(status === 'approved'
        ? [
            {
              at: draftedAt,
              actor: { type: 'person' as const, id: decider },
              action: 'approved' as const,
              note: null,
            },
          ]
        : []),
    ],
  };
}

export function testCases(t: Clock): TestCaseRecord[] {
  return [
    ...ecommerce.map((spec) => build(t, ECOM, 'batool-hani', t.daysAgo(2, 9, 40), spec)),
    ...clinic.map((spec) => build(t, CLINIC, 'batool-mahmoud', t.daysAgo(25), spec)),
    ...payments.map((spec) => build(t, PAY, 'batool-mahmoud', t.daysAgo(54), spec)),
    ...library.map((spec) => build(t, LIB, 'batool-hani', t.daysAgo(21), spec)),
  ];
}
