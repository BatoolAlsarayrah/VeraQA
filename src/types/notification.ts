import { z } from 'zod';

import { Actor, ProjectId, Timestamp } from './common';

export const NotificationTarget = z.object({
  type: z.enum([
    'requirement',
    'requirements',
    'scenario',
    'scenarios',
    'test-case',
    'test-cases',
    'run',
    'defect',
    'my-work',
    'members',
    'job',
  ]),
  id: z.string().nullable(),
});
export type NotificationTarget = z.infer<typeof NotificationTarget>;

export const Notification = z.object({
  id: z.string().min(1),
  projectId: ProjectId,
  title: z.string().min(1),
  detail: z.string().nullable(),
  at: Timestamp,
  unread: z.boolean(),
  actor: Actor,
  target: NotificationTarget,
});
export type Notification = z.infer<typeof Notification>;

export const NotificationKey = z.enum([
  'analysis-ready',
  'test-failed',
  'defect-reopened',
  'member-joined',
  'defect-assigned',
  'fix-failed-retest',
  'fix-closed',
  'tests-assigned',
  'retest-ready',
  'review-decision',
  'run-started',
]);
export type NotificationKey = z.infer<typeof NotificationKey>;

export const NotificationSettings = z.object({
  email: z.partialRecord(NotificationKey, z.boolean()),
});
export type NotificationSettings = z.infer<typeof NotificationSettings>;
