import type { InvitationRecord, MembershipRecord, ProjectRecord } from '../db';
import type { Clock } from './clock';

export const ECOM = 'e-commerce-portal-v2';
export const CLINIC = 'clinic-booking-app';
export const PAY = 'payments-api';
export const LIB = 'library-system';
export const BANK = 'mobile-banking-app';

const rules = { bulkApproval: true, rejectReason: true, engineersReportDefects: true };
const ai = { flagVague: true, flagMissing: true, flagContradictions: true, suggestRewrites: true };

export function projects(t: Clock): ProjectRecord[] {
  const project = (
    id: string,
    name: string,
    description: string,
    stage: ProjectRecord['stage'],
    createdDaysAgo: number,
    options: { solo?: boolean; targetDays?: number | null; environments?: string[] } = {},
  ): ProjectRecord => ({
    id,
    name,
    description,
    stage,
    solo: options.solo ?? false,
    createdAt: t.daysAgo(createdDaysAgo),
    settings: {
      targetDate: options.targetDays == null ? null : t.day(options.targetDays),
      environments: options.environments ?? ['Staging, Chrome 130', 'Staging, Firefox 132'],
      rules,
      ai,
      language: 'en',
    },
  });

  return [
    project(
      ECOM,
      'E-Commerce Portal v2',
      'Web shop rebuild: accounts, cart, checkout and payments',
      'reviewing-requirements',
      60,
      { targetDays: 25 },
    ),
    project(
      CLINIC,
      'Clinic booking app',
      'Patient appointments and doctor schedules',
      'running-tests',
      45,
      {
        targetDays: 40,
        environments: ['Staging, Chrome 130', 'Staging, Safari 18 on iPhone'],
      },
    ),
    project(PAY, 'Payments API', 'Card and wallet payments service', 'fixing-defects', 90, {
      targetDays: 12,
      environments: ['Sandbox, API client'],
    }),
    project(LIB, 'Library system', 'Course project, solo workspace', 'closing-defects', 30, {
      solo: true,
      environments: ['Local, Chrome 130'],
    }),
    project(
      BANK,
      'Mobile banking app',
      'Transfers and bill payments, release 2',
      'getting-started',
      2,
    ),
  ];
}

export const memberships: MembershipRecord[] = [
  { projectId: ECOM, personId: 'maria-ayman', role: 'project-manager' },
  { projectId: ECOM, personId: 'batool-hani', role: 'qa-lead' },
  { projectId: ECOM, personId: 'batool-mahmoud', role: 'qa-engineer' },
  { projectId: ECOM, personId: 'qays-kaled', role: 'developer' },
  { projectId: ECOM, personId: 'lina-saeed', role: 'developer' },
  { projectId: CLINIC, personId: 'lina-saeed', role: 'project-manager' },
  { projectId: CLINIC, personId: 'batool-mahmoud', role: 'qa-lead' },
  { projectId: CLINIC, personId: 'batool-hani', role: 'qa-engineer' },
  { projectId: CLINIC, personId: 'qays-kaled', role: 'developer' },
  { projectId: PAY, personId: 'maria-ayman', role: 'project-manager' },
  { projectId: PAY, personId: 'batool-mahmoud', role: 'qa-lead' },
  { projectId: PAY, personId: 'batool-hani', role: 'developer' },
  { projectId: PAY, personId: 'qays-kaled', role: 'developer' },
  { projectId: LIB, personId: 'batool-hani', role: 'project-manager' },
  { projectId: BANK, personId: 'lina-saeed', role: 'project-manager' },
];

export function invitations(t: Clock): InvitationRecord[] {
  return [
    {
      id: 'inv-mobile-banking',
      projectId: BANK,
      email: 'batool.hani@shop-team.com',
      role: 'qa-engineer',
      invitedBy: 'lina-saeed',
      at: t.ago(180),
    },
  ];
}
