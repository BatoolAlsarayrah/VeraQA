import { z } from 'zod';

import { ProjectId, RequirementRef, ScenarioRef, TestCaseRef, Timestamp } from './common';
import { ApiError } from './error';
import { ScenarioType } from './scenario';
import { TestCaseType } from './testCase';

export const JobStatus = z.enum(['queued', 'running', 'done', 'failed', 'cancelled']);
export type JobStatus = z.infer<typeof JobStatus>;

export const JobStep = z.object({
  label: z.string().min(1),
  detail: z.string().nullable(),
  status: z.enum(['waiting', 'running', 'done']),
});
export type JobStep = z.infer<typeof JobStep>;

const base = {
  id: z.string().min(1),
  projectId: ProjectId,
  status: JobStatus,
  step: z.number().int().nonnegative(),
  steps: z.array(JobStep).min(1),
  progress: z.number().min(0).max(1),
  startedAt: Timestamp,
  finishedAt: Timestamp.nullable(),
  error: ApiError.shape.error.nullable(),
};

const ItemProgress = z.enum(['waiting', 'running', 'done']);

export const AnalysisResult = z.object({
  requirements: z.number().int().nonnegative(),
  sections: z.number().int().nonnegative(),
  ambiguous: z.number().int().nonnegative(),
  missingInformation: z.number().int().nonnegative(),
  contradictions: z.number().int().nonnegative(),
  rewrites: z.number().int().nonnegative(),
});
export type AnalysisResult = z.infer<typeof AnalysisResult>;

export const ScenarioGenerationResult = z.object({
  drafted: z.number().int().nonnegative(),
  read: z.number().int().nonnegative(),
  covered: z.number().int().nonnegative(),
  tooVague: z.array(z.object({ requirement: RequirementRef, reason: z.string().min(1) })),
  groups: z.array(
    z.object({
      requirement: RequirementRef,
      scenarios: z.array(ScenarioRef.extend({ type: ScenarioType })),
    }),
  ),
});
export type ScenarioGenerationResult = z.infer<typeof ScenarioGenerationResult>;

export const TestCaseGenerationResult = z.object({
  drafted: z.number().int().nonnegative(),
  read: z.number().int().nonnegative(),
  covered: z.number().int().nonnegative(),
  needsTestData: z.array(z.object({ scenario: ScenarioRef, reason: z.string().min(1) })),
  groups: z.array(
    z.object({
      scenario: ScenarioRef,
      testCases: z.array(TestCaseRef.extend({ type: TestCaseType })),
    }),
  ),
});
export type TestCaseGenerationResult = z.infer<typeof TestCaseGenerationResult>;

export const Job = z.discriminatedUnion('kind', [
  z.object({
    ...base,
    kind: z.literal('analysis'),
    files: z.array(z.string().min(1)),
    result: AnalysisResult.nullable(),
  }),
  z.object({
    ...base,
    kind: z.literal('scenario-generation'),
    items: z.array(RequirementRef.extend({ progress: ItemProgress, drafted: z.number().int() })),
    result: ScenarioGenerationResult.nullable(),
  }),
  z.object({
    ...base,
    kind: z.literal('test-case-generation'),
    items: z.array(ScenarioRef.extend({ progress: ItemProgress, drafted: z.number().int() })),
    result: TestCaseGenerationResult.nullable(),
  }),
]);
export type Job = z.infer<typeof Job>;
export type JobKind = Job['kind'];
