import type { Attention, Dashboard } from '@/types';

import { api } from '../api';
import type { Db, DefectRecord } from '../db';
import { can, inProject } from '../rules';
import { bySeverity, currentRun, isOpen, work } from '../work';
import { activityView, recent } from './activity';

function review<T extends { projectId: string; status: string }>(list: T[], projectId: string) {
  const mine = list.filter((entry) => entry.projectId === projectId);
  return {
    total: mine.length,
    approved: mine.filter((entry) => entry.status === 'approved').length,
    pending: mine.filter((entry) => entry.status === 'pending-review').length,
  };
}

function defectRef(record: DefectRecord) {
  return { id: record.id, title: record.title, status: record.status };
}

function attention(db: Db, projectId: string, personId: string, approve: boolean): Attention[] {
  const items: Attention[] = [];
  const none = { count: null, item: null, run: null, defect: null };
  const pending = (list: { projectId: string; status: string }[]) =>
    list.filter((entry) => entry.projectId === projectId && entry.status === 'pending-review')
      .length;

  if (approve) {
    const kinds = [
      ['review-requirements', pending(db.requirements)],
      ['approve-scenarios', pending(db.scenarios)],
      ['approve-test-cases', pending(db.testCases)],
    ] as const;
    for (const [kind, count] of kinds) if (count) items.push({ ...none, kind, count });
  }

  const tests = work(db, projectId, personId).tests.length;
  if (tests) items.push({ ...none, kind: 'run-tests', count: tests });

  const run = currentRun(db, projectId);
  if (run) {
    const runRef = { number: run.number, name: run.name };
    for (const entry of db.entries) {
      if (entry.projectId !== projectId || entry.run !== run.number) continue;
      if (entry.result !== 'failed' && entry.result !== 'blocked') continue;
      const testCase = db.testCases.find(
        (item) => item.projectId === projectId && item.id === entry.testCaseId,
      );
      if (!testCase) continue;
      const defect =
        entry.result === 'blocked'
          ? db.defects.find(
              (item) => item.projectId === projectId && item.id === entry.blocked?.defectId,
            )
          : db.defects.find(
              (item) =>
                item.projectId === projectId &&
                item.source?.run === run.number &&
                item.source.testCaseId === entry.testCaseId,
            );
      items.push({
        kind: entry.result === 'failed' ? 'failed-test' : 'blocked-test',
        count: null,
        item: { type: 'test-case', id: testCase.id, title: testCase.title },
        run: runRef,
        defect: defect ? defectRef(defect) : null,
      });
    }
  }

  for (const defect of db.defects) {
    if (defect.projectId !== projectId || defect.status !== 'fixed') continue;
    const testCase = db.testCases.find(
      (item) => item.projectId === projectId && item.id === defect.source?.testCaseId,
    );
    items.push({
      kind: 'retest',
      count: null,
      item: testCase ? { type: 'test-case', id: testCase.id, title: testCase.title } : null,
      run: null,
      defect: defectRef(defect),
    });
  }
  return items;
}

export const dashboardHandlers = [
  api.get('/projects/:projectId/dashboard', (context): Dashboard => {
    const { me, member, projectId } = inProject(context, 'workspace');
    const { db } = context;
    const project = db.projects.find((entry) => entry.id === projectId);
    const defects = db.defects.filter((entry) => entry.projectId === projectId);
    const run = currentRun(db, projectId);
    const entries = run
      ? db.entries.filter((entry) => entry.projectId === projectId && entry.run === run.number)
      : [];
    const count = (result: string) => entries.filter((entry) => entry.result === result).length;
    return {
      targetDate: project?.settings.targetDate ?? null,
      stages: {
        srs: { files: db.files.filter((entry) => entry.projectId === projectId).length },
        requirements: review(db.requirements, projectId),
        scenarios: review(db.scenarios, projectId),
        testCases: review(db.testCases, projectId),
        run: run
          ? {
              number: run.number,
              name: run.name,
              total: entries.length,
              ran: entries.length - count('not-run'),
            }
          : null,
        defects: {
          open: defects.filter(isOpen).length,
          critical: defects.filter((entry) => isOpen(entry) && entry.severity === 'critical')
            .length,
        },
      },
      attention: attention(db, projectId, me.id, can(member, 'approve')),
      run: run
        ? {
            number: run.number,
            name: run.name,
            counts: {
              passed: count('passed'),
              failed: count('failed'),
              blocked: count('blocked'),
              notRun: count('not-run'),
            },
          }
        : null,
      defects: bySeverity(defects),
      activity: recent(db, projectId)
        .slice(0, 4)
        .map((entry) => activityView(db, entry)),
    };
  }),
];
