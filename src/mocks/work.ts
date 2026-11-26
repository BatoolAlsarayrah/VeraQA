import { capabilitiesFor } from '@/lib/permissions';
import type { TestResult } from '@/types';

import type { Db, DefectRecord } from './db';

export const OPEN = ['open', 'in-progress', 'fixed', 'retest', 'reopened'] as const;

export function isOpen(defect: DefectRecord) {
  return (OPEN as readonly string[]).includes(defect.status);
}

export function waitingOn(defect: DefectRecord): string | null {
  switch (defect.status) {
    case 'open':
    case 'in-progress':
    case 'reopened':
      return defect.assigneeId;
    case 'fixed':
    case 'invalid':
      return defect.reporterId;
    case 'retest':
      return (
        defect.history.findLast((event) => event.action === 'started-retest')?.actorId ??
        defect.reporterId
      );
    case 'closed':
      return null;
  }
}

function roleOf(db: Db, projectId: string, personId: string) {
  return db.memberships.find(
    (entry) => entry.projectId === projectId && entry.personId === personId,
  )?.role;
}

export function work(db: Db, projectId: string, personId: string) {
  const role = roleOf(db, projectId, personId);
  const capabilities = role ? capabilitiesFor(role) : [];
  const mine = <T extends { projectId: string; assigneeId: string | null }>(list: T[]) =>
    list.filter((entry) => entry.projectId === projectId && entry.assigneeId === personId);
  const activeRuns = new Set(
    db.runs
      .filter((run) => run.projectId === projectId && run.status === 'active')
      .map((run) => run.number),
  );
  const projectDefects = db.defects.filter((defect) => defect.projectId === projectId);

  return {
    requirements: mine(db.requirements).filter((entry) => entry.status === 'pending-review'),
    drafts: [
      ...mine(db.scenarios).filter((entry) => entry.status === 'pending-review'),
      ...mine(db.testCases).filter((entry) => entry.status === 'pending-review'),
    ],
    tests: mine(db.entries).filter(
      (entry) => activeRuns.has(entry.run) && entry.result === 'not-run',
    ),
    readyAgain: mine(db.entries).filter(
      (entry) => activeRuns.has(entry.run) && entry.result === 'blocked' && entry.readyToRunAgain,
    ),
    retests: capabilities.includes('test')
      ? projectDefects.filter(
          (defect) =>
            (defect.status === 'fixed' || defect.status === 'retest') &&
            waitingOn(defect) === personId,
        )
      : [],
    fixes: capabilities.includes('fix')
      ? projectDefects.filter(
          (defect) =>
            defect.assigneeId === personId &&
            ['open', 'in-progress', 'reopened'].includes(defect.status),
        )
      : [],
  };
}

export function workCount(db: Db, projectId: string, personId: string) {
  const items = work(db, projectId, personId);
  return Object.values(items).reduce((sum, list) => sum + list.length, 0);
}

export function entriesFor(db: Db, projectId: string, testCaseId: string) {
  return db.entries
    .filter((entry) => entry.projectId === projectId && entry.testCaseId === testCaseId)
    .sort((a, b) => b.run - a.run);
}

export function lastResult(db: Db, projectId: string, testCaseId: string): TestResult {
  const recorded = entriesFor(db, projectId, testCaseId)
    .filter((entry) => entry.result !== 'not-run' && entry.recordedAt)
    .sort((a, b) => (b.recordedAt ?? '').localeCompare(a.recordedAt ?? ''));
  return recorded[0]?.result ?? 'not-run';
}

export function currentRun(db: Db, projectId: string) {
  const size = (number: number) =>
    db.entries.filter((entry) => entry.projectId === projectId && entry.run === number).length;
  return db.runs
    .filter((run) => run.projectId === projectId && run.status === 'active')
    .sort((a, b) => size(b.number) - size(a.number) || b.number - a.number)[0];
}

export function bySeverity(defects: DefectRecord[]) {
  const open = defects.filter(isOpen);
  const count = (severity: DefectRecord['severity']) =>
    open.filter((defect) => defect.severity === severity).length;
  return {
    critical: count('critical'),
    high: count('high'),
    medium: count('medium'),
    low: count('low'),
  };
}
