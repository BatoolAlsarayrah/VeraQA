import { z } from 'zod';

import { Actor, Item, Timestamp } from './common';

export const ActivityType = z.enum([
  'srs',
  'requirements',
  'scenarios',
  'test-cases',
  'runs',
  'defects',
  'invalid',
  'blocked',
  'ai',
]);
export type ActivityType = z.infer<typeof ActivityType>;

export const ActivityEntry = z.object({
  id: z.string().min(1),
  at: Timestamp,
  actor: Actor,
  type: ActivityType,
  action: z.enum([
    'uploaded',
    'analyzed',
    'flagged',
    'drafted',
    'approved',
    'rejected',
    'edited',
    'started-run',
    'passed',
    'failed',
    'blocked',
    'reported',
    'started-fixing',
    'marked-fixed',
    'marked-invalid',
    'retest-passed',
    'retest-failed',
    'reopened',
    'joined',
  ]),
  item: Item,
  count: z.number().int().positive().nullable(),
});
export type ActivityEntry = z.infer<typeof ActivityEntry>;
