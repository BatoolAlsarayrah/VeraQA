import { z } from 'zod';

import { Day, Person, PersonId, ProjectId, Timestamp } from './common';
import { Role } from './session';

export const Stage = z.enum([
  'getting-started',
  'reviewing-requirements',
  'designing-tests',
  'running-tests',
  'fixing-defects',
  'closing-defects',
]);
export type Stage = z.infer<typeof Stage>;

export const Project = z.object({
  id: ProjectId,
  name: z.string().min(1),
  description: z.string(),
  role: Role,
  stage: Stage,
  solo: z.boolean(),
});
export type Project = z.infer<typeof Project>;

export const ProjectInput = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Give the project a name.')
    .max(80, 'Keep it under 80 characters.'),
  description: z.string().trim().max(240, 'Keep it under 240 characters.'),
  team: z.enum(['solo', 'team']),
});
export type ProjectInput = z.infer<typeof ProjectInput>;

export const Invitation = z.object({
  id: z.string().min(1),
  project: z.object({ id: ProjectId, name: z.string().min(1), description: z.string() }),
  role: Role,
  invitedBy: Person,
  at: Timestamp,
});
export type Invitation = z.infer<typeof Invitation>;

export const Counts = z.object({
  myWork: z.number().int().nonnegative(),
  pendingReview: z.number().int().nonnegative(),
  openDefects: z.number().int().nonnegative(),
});
export type Counts = z.infer<typeof Counts>;

export const Settings = z.object({
  name: z.string().min(1),
  description: z.string(),
  targetDate: Day.nullable(),
  prefixes: z.object({
    requirement: z.literal('REQ'),
    scenario: z.literal('SC'),
    testCase: z.literal('TC'),
    defect: z.literal('BUG'),
  }),
  environments: z.array(z.string().min(1)).min(1),
  rules: z.object({
    bulkApproval: z.boolean(),
    rejectReason: z.boolean(),
    engineersReportDefects: z.boolean(),
  }),
  ai: z.object({
    flagVague: z.boolean(),
    flagMissing: z.boolean(),
    flagContradictions: z.boolean(),
    suggestRewrites: z.boolean(),
  }),
  language: z.enum(['en', 'ar']),
  projectManager: Person,
});
export type Settings = z.infer<typeof Settings>;

export const SettingsInput = Settings.omit({ prefixes: true, projectManager: true }).partial();
export type SettingsInput = z.infer<typeof SettingsInput>;

export const TransferInput = z.object({ memberId: PersonId });
export type TransferInput = z.infer<typeof TransferInput>;

export const DeleteProjectInput = z.object({ confirmName: z.string().min(1) });
export type DeleteProjectInput = z.infer<typeof DeleteProjectInput>;
