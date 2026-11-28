import { z } from 'zod';

import {
  ItemEvent,
  Origin,
  Person,
  Priority,
  RequirementId,
  ReviewStatus,
  ScenarioRef,
  Timestamp,
} from './common';

export const FindingKind = z.enum(['ambiguous', 'missing-information', 'contradiction']);
export type FindingKind = z.infer<typeof FindingKind>;

export const Finding = z.object({
  n: z.number().int().positive(),
  kind: FindingKind,
  text: z.string().min(1),
  related: RequirementId.nullable(),
  resolved: z.boolean(),
});
export type Finding = z.infer<typeof Finding>;

export const Rewrite = z.object({ text: z.string().min(1) });
export type Rewrite = z.infer<typeof Rewrite>;

export const Source = z.object({
  file: z.string().nullable(),
  section: z.string().nullable(),
  page: z.number().int().positive().nullable(),
});
export type Source = z.infer<typeof Source>;

export const RequirementSummary = z.object({
  id: RequirementId,
  title: z.string().min(1),
  text: z.string().min(1),
  section: z.string().nullable(),
  status: ReviewStatus,
  priority: Priority.nullable(),
  openFindings: z.number().int().nonnegative(),
  assignee: Person.nullable(),
});
export type RequirementSummary = z.infer<typeof RequirementSummary>;

export const Requirement = RequirementSummary.extend({
  type: z.enum(['functional', 'non-functional']),
  origin: Origin,
  confidence: z.number().min(0).max(1).nullable(),
  source: Source,
  findings: z.array(Finding),
  rewrite: Rewrite.nullable(),
  rejectionReason: z.string().nullable(),
  decidedBy: Person.nullable(),
  decidedAt: Timestamp.nullable(),
  scenarios: z.array(ScenarioRef.extend({ status: ReviewStatus })),
  history: z.array(ItemEvent),
});
export type Requirement = z.infer<typeof Requirement>;

export const RequirementInput = z.object({
  title: z.string().trim().min(1, 'Give the requirement a short title.'),
  text: z.string().trim().min(1, 'Write the requirement text.'),
  section: z.string().trim().nullable(),
  type: z.enum(['functional', 'non-functional']),
});
export type RequirementInput = z.infer<typeof RequirementInput>;

export const TypedRequirementsInput = z.object({
  text: z.string().trim().min(1, 'Write at least one requirement, one per line.'),
});
export type TypedRequirementsInput = z.infer<typeof TypedRequirementsInput>;

export const SrsFile = z.object({
  name: z.string().regex(/\.(pdf|docx|txt)$/i, 'Use a PDF, DOCX or TXT file.'),
  size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024, 'Use a file of 10 MB or less.'),
});
export type SrsFile = z.infer<typeof SrsFile>;
