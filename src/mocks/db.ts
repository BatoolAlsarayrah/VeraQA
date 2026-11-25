import type {
  ActivityEntry,
  ActivityType,
  AnalysisResult,
  Attachment,
  BlockedReason,
  DefectEvent,
  DefectStatus,
  Finding,
  Item,
  ItemEvent,
  JobKind,
  NotificationKey,
  NotificationTarget,
  Priority,
  ReviewStatus,
  Role,
  ScenarioGenerationResult,
  ScenarioType,
  Settings,
  Severity,
  Stage,
  Step,
  StepResult,
  TestCaseGenerationResult,
  TestCaseType,
  TestDataItem,
  TestResult,
} from '@/types';

import { seed } from './seed';

export type ActorRecord = { type: 'person'; id: string } | { type: 'ai' };

export type PersonRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type ProjectRecord = {
  id: string;
  name: string;
  description: string;
  solo: boolean;
  stage: Stage;
  createdAt: string;
  settings: Omit<Settings, 'name' | 'description' | 'prefixes' | 'projectManager'>;
};

export type MembershipRecord = { projectId: string; personId: string; role: Role };

export type InvitationRecord = {
  id: string;
  projectId: string;
  email: string;
  role: Exclude<Role, 'project-manager'>;
  invitedBy: string;
  at: string;
};

export type EventRecord = Omit<ItemEvent, 'actor'> & { actor: ActorRecord };

type Review = {
  projectId: string;
  status: ReviewStatus;
  priority: Priority | null;
  origin: 'ai' | 'person';
  assigneeId: string | null;
  due: string | null;
  rejectionReason: string | null;
  history: EventRecord[];
};

export type SrsFileRecord = {
  projectId: string;
  name: string;
  size: number;
  pages: number | null;
  uploadedAt: string;
};

export type RequirementRecord = Review & {
  id: string;
  title: string;
  text: string;
  section: string | null;
  type: 'functional' | 'non-functional';
  confidence: number | null;
  source: { file: string | null; section: string | null; page: number | null };
  findings: Finding[];
  rewrite: string | null;
  decidedBy: string | null;
  decidedAt: string | null;
};

export type ScenarioRecord = Review & {
  id: string;
  requirementId: string;
  title: string;
  description: string;
  precondition: string | null;
  type: ScenarioType;
  testData: TestDataItem[];
};

export type TestCaseRecord = Review & {
  id: string;
  scenarioId: string;
  title: string;
  type: TestCaseType;
  precondition: string | null;
  testData: TestDataItem[];
  steps: Step[];
};

export type RunRecord = {
  projectId: string;
  number: number;
  name: string;
  environment: string;
  status: 'active' | 'closed';
  startedAt: string;
  closedAt: string | null;
};

export type EntryRecord = {
  projectId: string;
  run: number;
  testCaseId: string;
  assigneeId: string | null;
  due: string | null;
  result: TestResult;
  environment: string | null;
  steps: StepResult[];
  blocked: { step: number; reason: BlockedReason; details: string; defectId: string | null } | null;
  evidence: Attachment[];
  recordedBy: string | null;
  recordedAt: string | null;
  readyToRunAgain: boolean;
};

export type DefectRecord = {
  projectId: string;
  id: string;
  title: string;
  severity: Severity;
  status: DefectStatus;
  assigneeId: string;
  reporterId: string;
  steps: string[];
  expected: string;
  actual: string;
  environment: string;
  evidence: Attachment[];
  source: { run: number; testCaseId: string; step: number | null } | null;
  notes: { kind: 'fix' | 'invalid'; authorId: string; text: string; at: string }[];
  retests: {
    n: number;
    outcome: 'passed' | 'failed';
    byId: string;
    note: string | null;
    at: string;
  }[];
  history: (Omit<DefectEvent, 'actor'> & { actorId: string })[];
  reportedAt: string;
  updatedAt: string;
};

export type NotificationRecord = {
  id: string;
  personId: string;
  projectId: string;
  title: string;
  detail: string | null;
  at: string;
  unread: boolean;
  actor: ActorRecord;
  target: NotificationTarget;
};

export type ActivityRecord = {
  id: string;
  projectId: string;
  at: string;
  actor: ActorRecord;
  type: ActivityType;
  action: ActivityEntry['action'];
  item: Item;
  count: number | null;
};

export type JobRecord = {
  id: string;
  projectId: string;
  kind: JobKind;
  createdBy: string;
  startedAt: string;
  duration: number;
  steps: { label: string; detail: string | null }[];
  files: string[];
  items: string[];
  cancelled: boolean;
  finished: boolean;
  result: AnalysisResult | ScenarioGenerationResult | TestCaseGenerationResult | null;
};

export type Db = {
  version: number;
  signedIn: string | null;
  people: PersonRecord[];
  projects: ProjectRecord[];
  memberships: MembershipRecord[];
  invitations: InvitationRecord[];
  files: SrsFileRecord[];
  requirements: RequirementRecord[];
  scenarios: ScenarioRecord[];
  testCases: TestCaseRecord[];
  runs: RunRecord[];
  entries: EntryRecord[];
  defects: DefectRecord[];
  notifications: NotificationRecord[];
  activity: ActivityRecord[];
  jobs: JobRecord[];
  emailSettings: Record<string, Partial<Record<NotificationKey, boolean>>>;
};

export const DB_VERSION = 1;
const KEY = 'veraqa-mock-db';

let db: Db | null = null;

function fresh(): Db {
  return { ...seed(Date.now()), version: DB_VERSION };
}

function load(): Db | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Db>;
    return parsed.version === DB_VERSION ? (parsed as Db) : null;
  } catch {
    return null;
  }
}

export function getDb(): Db {
  db ??= load() ?? fresh();
  return db;
}

export function saveDb() {
  if (!db) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // Storage can be full or blocked; the data still holds until the page reloads.
  }
}

export function resetDb() {
  const signedIn = db?.signedIn ?? null;
  db = fresh();
  db.signedIn = signedIn;
  saveDb();
  return db;
}

export function nextId(prefix: string, existing: string[]) {
  const top = existing.reduce((max, id) => Math.max(max, Number(id.split('-')[1] ?? 0)), 0);
  return `${prefix}-${String(top + 1).padStart(3, '0')}`;
}
