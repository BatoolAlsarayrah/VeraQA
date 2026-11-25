import { z } from 'zod';

import {
  Attachment,
  DefectId,
  DefectStatus,
  Person,
  PersonId,
  RequirementRef,
  RunNumber,
  RunRef,
  ScenarioRef,
  Severity,
  TestCaseId,
  TestCaseRef,
  Timestamp,
} from './common';

export const DefectSummary = z.object({
  id: DefectId,
  title: z.string().min(1),
  severity: Severity,
  status: DefectStatus,
  assignee: Person,
  reporter: Person,
  testCase: TestCaseRef.nullable(),
  reportedAt: Timestamp,
  updatedAt: Timestamp,
});
export type DefectSummary = z.infer<typeof DefectSummary>;

export const DefectNote = z.object({
  kind: z.enum(['fix', 'invalid']),
  author: Person,
  text: z.string().min(1),
  at: Timestamp,
});
export type DefectNote = z.infer<typeof DefectNote>;

export const Retest = z.object({
  n: z.number().int().positive(),
  outcome: z.enum(['passed', 'failed']),
  by: Person,
  note: z.string().nullable(),
  at: Timestamp,
});
export type Retest = z.infer<typeof Retest>;

export const DefectEvent = z.object({
  at: Timestamp,
  actor: Person,
  action: z.enum([
    'reported',
    'assigned',
    'started-fixing',
    'marked-fixed',
    'marked-invalid',
    'started-retest',
    'retest-passed',
    'retest-failed',
    'reopened',
  ]),
  status: DefectStatus,
  note: z.string().nullable(),
});
export type DefectEvent = z.infer<typeof DefectEvent>;

export const Defect = DefectSummary.extend({
  steps: z.array(z.string().min(1)),
  expected: z.string().min(1),
  actual: z.string().min(1),
  environment: z.string().min(1),
  evidence: z.array(Attachment),
  source: z
    .object({ run: RunRef, testCase: TestCaseRef, step: z.number().int().positive().nullable() })
    .nullable(),
  trace: z.object({ scenario: ScenarioRef, requirement: RequirementRef }).nullable(),
  notes: z.array(DefectNote),
  retests: z.array(Retest),
  history: z.array(DefectEvent),
  waitingOn: Person.nullable(),
});
export type Defect = z.infer<typeof Defect>;

export const DefectInput = z.object({
  title: z.string().trim().min(1, 'Give the defect a title.'),
  severity: Severity,
  assigneeId: PersonId,
  steps: z.array(z.string().trim().min(1)).min(1, 'Add the steps to reproduce it.'),
  expected: z.string().trim().min(1, 'Say what should happen.'),
  actual: z.string().trim().min(1, 'Say what happened instead.'),
  environment: z.string().min(1, 'Choose where it happened.'),
  source: z
    .object({
      run: RunNumber,
      testCaseId: TestCaseId,
      step: z.number().int().positive().nullable(),
    })
    .nullable(),
});
export type DefectInput = z.infer<typeof DefectInput>;

export const RetestInput = z
  .object({ outcome: z.enum(['passed', 'failed']), note: z.string().trim().nullable() })
  .refine((input) => input.outcome === 'passed' || Boolean(input.note), {
    path: ['note'],
    message: 'Say what still fails, so the developer can pick it up.',
  });
export type RetestInput = z.infer<typeof RetestInput>;

export const AssignInput = z.object({ assigneeId: PersonId });
export type AssignInput = z.infer<typeof AssignInput>;
