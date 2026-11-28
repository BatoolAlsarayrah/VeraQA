import { z } from 'zod';

import { ActivityEntry } from './activity';
import { Day, DefectRef, Item, RunRef } from './common';
import { ResultCounts } from './run';

const count = z.number().int().nonnegative();
const Review = z.object({ total: count, approved: count, pending: count });

export const BySeverity = z.object({ critical: count, high: count, medium: count, low: count });
export type BySeverity = z.infer<typeof BySeverity>;

export const Attention = z.object({
  kind: z.enum([
    'review-requirements',
    'approve-scenarios',
    'approve-test-cases',
    'run-tests',
    'failed-test',
    'blocked-test',
    'retest',
  ]),
  count: count.nullable(),
  item: Item.nullable(),
  run: RunRef.nullable(),
  defect: DefectRef.nullable(),
});
export type Attention = z.infer<typeof Attention>;

export const Dashboard = z.object({
  targetDate: Day.nullable(),
  stages: z.object({
    srs: z.object({ files: count }),
    requirements: Review,
    scenarios: Review,
    testCases: Review,
    run: RunRef.extend({ total: count, ran: count }).nullable(),
    defects: z.object({ open: count, critical: count }),
  }),
  attention: z.array(Attention),
  run: RunRef.extend({ counts: ResultCounts }).nullable(),
  defects: BySeverity,
  activity: z.array(ActivityEntry),
});
export type Dashboard = z.infer<typeof Dashboard>;
