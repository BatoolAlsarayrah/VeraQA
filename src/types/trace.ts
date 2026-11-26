import { z } from 'zod';

import {
  DefectRef,
  RequirementId,
  ReviewStatus,
  ScenarioId,
  TestCaseId,
  TestCaseRef,
  TestResult,
} from './common';

export const TraceTestCase = z.object({
  id: TestCaseId,
  title: z.string(),
  status: ReviewStatus,
  lastResult: TestResult,
  defects: z.array(DefectRef),
});
export type TraceTestCase = z.infer<typeof TraceTestCase>;

export const TraceScenario = z.object({
  id: ScenarioId,
  title: z.string(),
  status: ReviewStatus,
  testCases: z.array(TraceTestCase),
});
export type TraceScenario = z.infer<typeof TraceScenario>;

export const TraceRequirement = z.object({
  id: RequirementId,
  title: z.string(),
  text: z.string(),
  scenarios: z.array(TraceScenario),
});
export type TraceRequirement = z.infer<typeof TraceRequirement>;

export const Trace = z.object({
  requirements: z.array(TraceRequirement),
  gaps: z.object({
    failedOrBlocked: z.array(
      TestCaseRef.extend({ result: TestResult, blockedBy: DefectRef.nullable() }),
    ),
    scenariosWithoutTests: z.array(z.object({ id: ScenarioId, title: z.string() })),
    notRun: z.array(TestCaseRef),
    pendingRequirements: z.number().int().nonnegative(),
  }),
});
export type Trace = z.infer<typeof Trace>;
