import { z } from 'zod';

import {
  Attachment,
  DefectId,
  DefectRef,
  Person,
  PersonId,
  RequirementRef,
  RunNumber,
  ScenarioRef,
  TestCaseId,
  TestCaseRef,
  TestDataItem,
  TestResult,
  Timestamp,
} from './common';
import { Step } from './testCase';

export const ResultCounts = z.object({
  passed: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  blocked: z.number().int().nonnegative(),
  notRun: z.number().int().nonnegative(),
});
export type ResultCounts = z.infer<typeof ResultCounts>;

export const RunSummary = z.object({
  number: RunNumber,
  name: z.string().min(1),
  environment: z.string().min(1),
  status: z.enum(['active', 'closed']),
  startedAt: Timestamp,
  closedAt: Timestamp.nullable(),
  counts: ResultCounts,
});
export type RunSummary = z.infer<typeof RunSummary>;

export const BlockedReason = z.enum([
  'environment-down',
  'test-data-missing',
  'blocked-by-defect',
  'depends-on-test',
  'other',
]);
export type BlockedReason = z.infer<typeof BlockedReason>;

export const Blocked = z.object({
  step: z.number().int().positive(),
  reason: BlockedReason,
  details: z.string(),
  defect: DefectRef.nullable(),
});
export type Blocked = z.infer<typeof Blocked>;

export const RunEntry = z.object({
  testCase: TestCaseRef,
  scenario: ScenarioRef,
  assignee: Person.nullable(),
  result: TestResult,
  blocked: Blocked.nullable(),
  readyToRunAgain: z.boolean(),
});
export type RunEntry = z.infer<typeof RunEntry>;

export const Run = RunSummary.extend({ entries: z.array(RunEntry) });
export type Run = z.infer<typeof Run>;

export const StepResult = z.object({
  n: z.number().int().positive(),
  result: TestResult,
  actual: z.string().nullable(),
});
export type StepResult = z.infer<typeof StepResult>;

export const RunTest = z.object({
  run: z.object({ number: RunNumber, name: z.string().min(1), environment: z.string().min(1) }),
  testCase: TestCaseRef.extend({
    precondition: z.string().nullable(),
    testData: z.array(TestDataItem),
    steps: z.array(Step).min(1),
  }),
  scenario: ScenarioRef,
  requirement: RequirementRef,
  assignee: Person.nullable(),
  result: TestResult,
  environment: z.string().nullable(),
  steps: z.array(StepResult),
  blocked: Blocked.nullable(),
  evidence: z.array(Attachment),
  defect: DefectRef.nullable(),
  environments: z.array(z.string().min(1)),
  recordedBy: Person.nullable(),
  recordedAt: Timestamp.nullable(),
});
export type RunTest = z.infer<typeof RunTest>;

export const ResultInput = z
  .object({
    environment: z.string().min(1, 'Choose where you ran it.'),
    steps: z
      .array(
        z.object({
          n: z.number().int().positive(),
          result: TestResult,
          actual: z.string().trim().nullable(),
        }),
      )
      .min(1),
    blocked: z
      .object({
        reason: BlockedReason,
        details: z.string().trim(),
        defectId: DefectId.nullable(),
      })
      .nullable(),
  })
  .superRefine((input, ctx) => {
    const blockedAt = input.steps.findIndex((step) => step.result === 'blocked');
    if (blockedAt >= 0 && !input.blocked) {
      ctx.addIssue({ code: 'custom', path: ['blocked'], message: 'Say why the test is blocked.' });
    }
    if (blockedAt < 0 && input.blocked) {
      ctx.addIssue({
        code: 'custom',
        path: ['blocked'],
        message: 'Mark the step that is blocked.',
      });
    }
    if (
      blockedAt >= 0 &&
      input.steps.slice(blockedAt + 1).some((step) => step.result !== 'not-run')
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['steps'],
        message: 'Steps after a blocked step stay not run.',
      });
    }
    if (input.blocked?.reason === 'blocked-by-defect' && !input.blocked.defectId) {
      ctx.addIssue({
        code: 'custom',
        path: ['blocked', 'defectId'],
        message: 'Choose the defect that blocks it, or report a new one.',
      });
    }
    input.steps.forEach((step, index) => {
      if (step.result === 'failed' && !step.actual) {
        ctx.addIssue({
          code: 'custom',
          path: ['steps', index, 'actual'],
          message: 'Say what happened instead.',
        });
      }
    });
  });
export type ResultInput = z.infer<typeof ResultInput>;

export const RunInput = z.object({
  name: z.string().trim().min(1, 'Give the run a name.'),
  environment: z.string().min(1, 'Choose where it runs.'),
  entries: z
    .array(z.object({ testCaseId: TestCaseId, assigneeId: PersonId.nullable() }))
    .min(1, 'Choose at least one test case.'),
});
export type RunInput = z.infer<typeof RunInput>;

export const RunUpdateInput = z.object({ status: z.literal('closed') });
export type RunUpdateInput = z.infer<typeof RunUpdateInput>;

export const EntryInput = z.object({ assigneeId: PersonId.nullable() });
export type EntryInput = z.infer<typeof EntryInput>;

export const EvidenceFile = z.object({
  name: z.string().regex(/\.(png|jpe?g)$/i, 'Use a PNG or JPG image.'),
  size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024, 'Use an image of 10 MB or less.'),
});
export type EvidenceFile = z.infer<typeof EvidenceFile>;
