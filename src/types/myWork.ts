import { z } from 'zod';

import { Day, DefectRef, Item, ItemType, Person, PersonId, RunRef, TestCaseRef } from './common';

export const WorkItem = z.object({
  item: Item,
  due: Day.nullable(),
  run: RunRef.nullable(),
  assignedBy: Person.nullable(),
  openFindings: z.number().int().nonnegative().nullable(),
  draftedFor: Item.nullable(),
  blockedBy: DefectRef.nullable(),
  fixedBy: Person.nullable(),
  retest: TestCaseRef.nullable(),
});
export type WorkItem = z.infer<typeof WorkItem>;

export const WorkGroup = z.object({
  kind: z.enum([
    'requirements-to-review',
    'drafts-to-approve',
    'tests-to-run',
    'ready-to-run-again',
    'retests',
    'defects-to-fix',
  ]),
  items: z.array(WorkItem),
});
export type WorkGroup = z.infer<typeof WorkGroup>;

export const MyWork = z.object({ groups: z.array(WorkGroup) });
export type MyWork = z.infer<typeof MyWork>;

export const AssignmentInput = z.object({
  items: z
    .array(z.object({ type: ItemType.exclude(['run', 'file']), id: z.string().min(1) }))
    .min(1, 'Choose at least one item.'),
  assigneeId: PersonId,
  due: Day.nullable(),
});
export type AssignmentInput = z.infer<typeof AssignmentInput>;
