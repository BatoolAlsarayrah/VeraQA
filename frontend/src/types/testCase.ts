import { z } from 'zod';

import {
  DefectRef,
  ItemEvent,
  Origin,
  Person,
  Priority,
  RequirementRef,
  ReviewStatus,
  RunRef,
  ScenarioRef,
  TestCaseId,
  TestDataItem,
  TestResult,
  Timestamp,
} from './common';

export const TestCaseType = z.enum(['normal', 'wrong-input', 'limit']);
export type TestCaseType = z.infer<typeof TestCaseType>;

export const Step = z.object({
  n: z.number().int().positive(),
  action: z.string().min(1),
  expected: z.string().min(1),
});
export type Step = z.infer<typeof Step>;

export const TestCaseSummary = z.object({
  id: TestCaseId,
  title: z.string().min(1),
  type: TestCaseType,
  priority: Priority.nullable(),
  status: ReviewStatus,
  origin: Origin,
  lastResult: TestResult,
  scenario: ScenarioRef,
  assignee: Person.nullable(),
});
export type TestCaseSummary = z.infer<typeof TestCaseSummary>;

export const RunHistoryEntry = RunRef.extend({
  result: TestResult,
  failedStep: z.number().int().positive().nullable(),
  at: Timestamp.nullable(),
});
export type RunHistoryEntry = z.infer<typeof RunHistoryEntry>;

export const TestCase = TestCaseSummary.extend({
  requirement: RequirementRef,
  precondition: z.string().nullable(),
  testData: z.array(TestDataItem),
  steps: z.array(Step).min(1),
  runs: z.array(RunHistoryEntry),
  defects: z.array(DefectRef),
  rejectionReason: z.string().nullable(),
  history: z.array(ItemEvent),
});
export type TestCase = z.infer<typeof TestCase>;

export const TestCaseInput = z.object({
  title: z.string().trim().min(1, 'Give the test case a title.'),
  type: TestCaseType,
  precondition: z.string().trim().nullable(),
  testData: z.array(TestDataItem),
  steps: z
    .array(
      z.object({
        action: z.string().trim().min(1, 'Say what to do in this step.'),
        expected: z.string().trim().min(1, 'Say what should happen.'),
      }),
    )
    .min(1, 'Add at least one step.'),
});
export type TestCaseInput = z.infer<typeof TestCaseInput>;
