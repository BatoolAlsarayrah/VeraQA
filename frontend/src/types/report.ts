import { z } from 'zod';

import { Person, RequirementRef, RunNumber } from './common';
import { BySeverity } from './dashboard';
import { Role } from './session';

const count = z.number().int().nonnegative();
const Share = z.object({ covered: count, total: count });

export const ReportPeriod = z.enum(['sprint', '30d', 'all']);
export type ReportPeriod = z.infer<typeof ReportPeriod>;

export const Report = z.object({
  period: ReportPeriod,
  requirements: z.object({ total: count, approved: count, pending: count }),
  scenarioCoverage: Share,
  testCaseCoverage: Share,
  passRate: z.object({ run: RunNumber.nullable(), passed: count, ran: count, total: count }),
  openDefects: BySeverity,
  runs: z.array(
    z.object({ number: RunNumber, passed: count, failed: count, blocked: count, notRun: count }),
  ),
  coverage: z.array(
    z.object({
      requirement: RequirementRef,
      scenarios: count,
      testCases: count,
      passed: count,
      openDefects: count,
    }),
  ),
  ai: z.object({ accepted: count, edited: count, rejected: count }),
  workload: z.array(z.object({ person: Person, role: Role, done: count, total: count })),
});
export type Report = z.infer<typeof Report>;
