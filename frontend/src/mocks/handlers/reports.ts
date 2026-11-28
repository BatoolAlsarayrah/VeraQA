import { HttpResponse } from 'msw';

import { type Report, ReportPeriod } from '@/types';

import { api } from '../api';
import type { Db } from '../db';
import { inProject, person } from '../rules';
import { bySeverity, currentRun, isOpen, lastResult } from '../work';
import { workload } from './members';

const DAY = 24 * 60 * 60 * 1000;

function coverage(db: Db, projectId: string) {
  const approved = db.requirements.filter(
    (entry) => entry.projectId === projectId && entry.status === 'approved',
  );
  return approved.map((requirement) => {
    const scenarios = db.scenarios.filter(
      (entry) =>
        entry.projectId === projectId &&
        entry.requirementId === requirement.id &&
        entry.status === 'approved',
    );
    const testCases = db.testCases.filter(
      (entry) =>
        entry.projectId === projectId &&
        entry.status === 'approved' &&
        scenarios.some((scenario) => scenario.id === entry.scenarioId),
    );
    return {
      requirement: { id: requirement.id, title: requirement.title },
      scenarios: scenarios.length,
      testCases: testCases.length,
      passed: testCases.filter((entry) => lastResult(db, projectId, entry.id) === 'passed').length,
      openDefects: db.defects.filter(
        (defect) =>
          defect.projectId === projectId &&
          isOpen(defect) &&
          testCases.some((entry) => entry.id === defect.source?.testCaseId),
      ).length,
    };
  });
}

function report(db: Db, projectId: string, period: ReportPeriod): Report {
  const requirements = db.requirements.filter((entry) => entry.projectId === projectId);
  const rows = coverage(db, projectId);
  const run = currentRun(db, projectId);
  const runEntries = run
    ? db.entries.filter((entry) => entry.projectId === projectId && entry.run === run.number)
    : [];
  const since = period === '30d' ? Date.now() - 30 * DAY : null;
  const runs = db.runs
    .filter(
      (entry) =>
        entry.projectId === projectId &&
        (period === 'all' ||
          (period === 'sprint'
            ? entry.status === 'active'
            : Date.parse(entry.startedAt) >= (since ?? 0))),
    )
    .sort((a, b) => a.number - b.number)
    .map((entry) => {
      const results = db.entries.filter(
        (item) => item.projectId === projectId && item.run === entry.number,
      );
      const count = (result: string) => results.filter((item) => item.result === result).length;
      return {
        number: entry.number,
        passed: count('passed'),
        failed: count('failed'),
        blocked: count('blocked'),
        notRun: count('not-run'),
      };
    });
  const aiItems = [...requirements, ...db.scenarios, ...db.testCases].filter(
    (entry) =>
      entry.projectId === projectId && entry.origin === 'ai' && entry.status !== 'pending-review',
  );
  const edited = (entry: (typeof aiItems)[number]) =>
    entry.history.some((event) => event.action === 'edited' || event.action === 'rewrite-accepted');
  const ran = runEntries.filter((entry) => entry.result !== 'not-run');

  return {
    period,
    requirements: {
      total: requirements.length,
      approved: requirements.filter((entry) => entry.status === 'approved').length,
      pending: requirements.filter((entry) => entry.status === 'pending-review').length,
    },
    scenarioCoverage: {
      covered: rows.filter((row) => row.scenarios > 0).length,
      total: rows.length,
    },
    testCaseCoverage: {
      covered: rows.filter((row) => row.testCases > 0).length,
      total: rows.length,
    },
    passRate: {
      run: run?.number ?? null,
      passed: ran.filter((entry) => entry.result === 'passed').length,
      ran: ran.length,
      total: runEntries.length,
    },
    openDefects: bySeverity(db.defects.filter((entry) => entry.projectId === projectId)),
    runs,
    coverage: rows,
    ai: {
      accepted: aiItems.filter((entry) => entry.status === 'approved' && !edited(entry)).length,
      edited: aiItems.filter((entry) => entry.status === 'approved' && edited(entry)).length,
      rejected: aiItems.filter((entry) => entry.status === 'rejected').length,
    },
    workload: db.memberships
      .filter((entry) => entry.projectId === projectId)
      .map((entry) => {
        const load = workload(db, projectId, entry.personId, entry.role);
        return {
          person: person(db, entry.personId),
          role: entry.role,
          done: load.done,
          total: load.assigned,
        };
      }),
  };
}

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export const reportHandlers = [
  api.get('/projects/:projectId/reports', (context) => {
    const { projectId } = inProject(context, 'manage');
    const period = ReportPeriod.catch('sprint').parse(
      context.url.searchParams.get('period') ?? 'sprint',
    );
    return report(context.db, projectId, period);
  }),

  api.get('/projects/:projectId/reports/export.csv', (context) => {
    const { projectId } = inProject(context, 'manage');
    const header = ['Requirement', 'Title', 'Scenarios', 'Test cases', 'Passed', 'Open defects'];
    const lines = coverage(context.db, projectId).map((row) =>
      [
        row.requirement.id,
        row.requirement.title,
        row.scenarios,
        row.testCases,
        row.passed,
        row.openDefects,
      ]
        .map(csvCell)
        .join(','),
    );
    return new HttpResponse([header.join(','), ...lines].join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${projectId}-coverage.csv"`,
      },
    });
  }),
];
