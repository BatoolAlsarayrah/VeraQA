import { z } from 'zod';

export const RequirementId = z.string().regex(/^REQ-\d{3,}$/);
export const ScenarioId = z.string().regex(/^SC-\d{3,}$/);
export const TestCaseId = z.string().regex(/^TC-\d{3,}$/);
export const DefectId = z.string().regex(/^BUG-\d{3,}$/);
export const RunNumber = z.number().int().positive();
export const ProjectId = z.string().min(1);
export const PersonId = z.string().min(1);

export const Timestamp = z.iso.datetime();
export const Day = z.iso.date();

export const Priority = z.enum(['critical', 'high', 'medium', 'low']);
export type Priority = z.infer<typeof Priority>;

export const Severity = Priority;
export type Severity = Priority;

export const ReviewStatus = z.enum(['pending-review', 'approved', 'rejected']);
export type ReviewStatus = z.infer<typeof ReviewStatus>;

export const TestResult = z.enum(['not-run', 'passed', 'failed', 'blocked']);
export type TestResult = z.infer<typeof TestResult>;

export const DefectStatus = z.enum([
  'open',
  'in-progress',
  'fixed',
  'retest',
  'closed',
  'reopened',
  'invalid',
]);
export type DefectStatus = z.infer<typeof DefectStatus>;

export const Origin = z.enum(['ai', 'person']);
export type Origin = z.infer<typeof Origin>;

export const Person = z.object({ id: PersonId, name: z.string().min(1) });
export type Person = z.infer<typeof Person>;

export const Actor = z.discriminatedUnion('type', [
  z.object({ type: z.literal('person'), id: PersonId, name: z.string().min(1) }),
  z.object({ type: z.literal('ai') }),
]);
export type Actor = z.infer<typeof Actor>;

export const ItemType = z.enum(['requirement', 'scenario', 'test-case', 'run', 'defect', 'file']);
export type ItemType = z.infer<typeof ItemType>;

export const Item = z.object({ type: ItemType, id: z.string().min(1), title: z.string() });
export type Item = z.infer<typeof Item>;

export const RequirementRef = z.object({ id: RequirementId, title: z.string() });
export type RequirementRef = z.infer<typeof RequirementRef>;

export const ScenarioRef = z.object({ id: ScenarioId, title: z.string() });
export type ScenarioRef = z.infer<typeof ScenarioRef>;

export const TestCaseRef = z.object({ id: TestCaseId, title: z.string() });
export type TestCaseRef = z.infer<typeof TestCaseRef>;

export const DefectRef = z.object({ id: DefectId, title: z.string(), status: DefectStatus });
export type DefectRef = z.infer<typeof DefectRef>;

export const RunRef = z.object({ number: RunNumber, name: z.string() });
export type RunRef = z.infer<typeof RunRef>;

export const TestDataItem = z.object({ label: z.string().min(1), value: z.string() });
export type TestDataItem = z.infer<typeof TestDataItem>;

export const ItemEvent = z.object({
  at: Timestamp,
  actor: Actor,
  action: z.enum([
    'created',
    'drafted',
    'edited',
    'approved',
    'rejected',
    'returned-to-review',
    'priority-set',
    'rewrite-accepted',
    'finding-resolved',
  ]),
  note: z.string().nullable(),
});
export type ItemEvent = z.infer<typeof ItemEvent>;

export const Attachment = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  size: z.number().int().nonnegative(),
  type: z.string().min(1),
});
export type Attachment = z.infer<typeof Attachment>;

export function list<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item) });
}

export const JobStart = z.object({ jobId: z.string().min(1) });
export type JobStart = z.infer<typeof JobStart>;

export const PriorityInput = z.object({ priority: Priority });
export type PriorityInput = z.infer<typeof PriorityInput>;

export const ReasonInput = z.object({ reason: z.string().trim().min(1) });
export type ReasonInput = z.infer<typeof ReasonInput>;

export const NoteInput = z.object({ note: z.string().trim().min(1) });
export type NoteInput = z.infer<typeof NoteInput>;
