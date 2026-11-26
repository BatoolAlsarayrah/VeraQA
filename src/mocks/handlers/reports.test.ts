import { describe, expect, it } from 'vitest';

import { request } from '@/lib';
import { Report } from '@/types';

import { getDb } from '../db';
import { mockServer } from '../server';

mockServer();

const ECOM = '/projects/e-commerce-portal-v2/reports';

describe('reports', () => {
  it('reports coverage, the pass rate and open defects', async () => {
    const report = await request(ECOM, Report);

    expect(report).toMatchObject({
      period: 'sprint',
      requirements: { total: 26, approved: 21, pending: 5 },
      scenarioCoverage: { covered: 7, total: 21 },
      testCaseCoverage: { covered: 7, total: 21 },
      passRate: { run: 12, passed: 18, ran: 22, total: 34 },
      openDefects: { critical: 1, high: 3, medium: 2, low: 1 },
    });
    expect(report.coverage.find((row) => row.requirement.id === 'REQ-014')).toMatchObject({
      scenarios: 2,
      testCases: 5,
      passed: 4,
      openDefects: 1,
    });
    expect(report.workload.find((row) => row.person.id === 'batool-hani')).toMatchObject({
      role: 'qa-lead',
      done: 11,
      total: 19,
    });
  });

  it('shows the runs for the chosen period', async () => {
    const sprint = await request(ECOM, Report);
    const all = await request(ECOM, Report, { query: { period: 'all' } });

    expect(sprint.runs.map((run) => run.number)).toEqual([12, 13]);
    expect(all.runs.map((run) => run.number)).toEqual([9, 10, 11, 12, 13]);
  });

  it('exports the coverage table as CSV', async () => {
    const response = await fetch(`${window.location.origin}/api${ECOM}/export.csv`);
    const lines = (await response.text()).split('\n');

    expect(response.headers.get('Content-Type')).toMatch(/^text\/csv/);
    expect(response.headers.get('Content-Disposition')).toContain(
      'e-commerce-portal-v2-coverage.csv',
    );
    expect(lines[0]).toBe('Requirement,Title,Scenarios,Test cases,Passed,Open defects');
    expect(lines).toHaveLength(22);
  });

  it('is only for people who manage', async () => {
    getDb().signedIn = 'batool-mahmoud';

    await expect(request(ECOM, Report)).rejects.toMatchObject({ status: 403 });
  });
});
