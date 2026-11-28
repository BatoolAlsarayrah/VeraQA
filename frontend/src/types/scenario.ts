import { z } from 'zod';

import {
  ItemEvent,
  Origin,
  Priority,
  RequirementRef,
  ReviewStatus,
  ScenarioId,
  TestCaseRef,
  TestDataItem,
  TestResult,
} from './common';

export const ScenarioType = z.enum(['positive', 'negative']);
export type ScenarioType = z.infer<typeof ScenarioType>;

export const ScenarioSummary = z.object({
  id: ScenarioId,
  title: z.string().min(1),
  type: ScenarioType,
  priority: Priority.nullable(),
  status: ReviewStatus,
  origin: Origin,
  requirement: RequirementRef,
  testCases: z.array(TestCaseRef.extend({ status: ReviewStatus, lastResult: TestResult })),
});
export type ScenarioSummary = z.infer<typeof ScenarioSummary>;

export const Scenario = ScenarioSummary.extend({
  description: z.string(),
  precondition: z.string().nullable(),
  testData: z.array(TestDataItem),
  rejectionReason: z.string().nullable(),
  history: z.array(ItemEvent),
});
export type Scenario = z.infer<typeof Scenario>;

export const ScenarioInput = z.object({
  title: z.string().trim().min(1, 'Give the scenario a title.'),
  description: z.string().trim(),
  precondition: z.string().trim().nullable(),
  type: ScenarioType,
  testData: z.array(TestDataItem),
});
export type ScenarioInput = z.infer<typeof ScenarioInput>;
