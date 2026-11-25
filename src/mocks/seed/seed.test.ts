import { describe, expect, it } from 'vitest';

import { capabilitiesFor } from '@/lib/permissions';
import {
  BlockedReason,
  type Capability,
  Day,
  DefectId,
  DefectStatus,
  RequirementId,
  ReviewStatus,
  ScenarioId,
  TestCaseId,
  TestResult,
  Timestamp,
} from '@/types';

import { seed } from '.';
import { BANK, CLINIC, ECOM, LIB, PAY } from './projects';

const now = Date.now();
const db = seed(now);

function can(projectId: string, personId: string, capability: Capability) {
  const member = db.memberships.find(
    (entry) => entry.projectId === projectId && entry.personId === personId,
  );
  return member ? capabilitiesFor(member.role).includes(capability) : false;
}

function inProject<T extends { projectId: string }>(list: T[], projectId: string) {
  return list.filter((entry) => entry.projectId === projectId);
}

describe('seed people and projects', () => {
  it('gives every membership a real person and project, and every project one manager', () => {
    for (const membership of db.memberships) {
      expect(db.people.some((person) => person.id === membership.personId)).toBe(true);
      expect(db.projects.some((project) => project.id === membership.projectId)).toBe(true);
    }
    for (const project of db.projects) {
      const managers = inProject(db.memberships, project.id).filter(
        (entry) => entry.role === 'project-manager',
      );
      expect(managers, project.id).toHaveLength(1);
    }
  });

  it('gives Batool Hani the four roles the shell has shown since Phase 2', () => {
    const role = (projectId: string) =>
      db.memberships.find(
        (entry) => entry.projectId === projectId && entry.personId === 'batool-hani',
      )?.role;

    expect(role(ECOM)).toBe('qa-lead');
    expect(role(CLINIC)).toBe('qa-engineer');
    expect(role(PAY)).toBe('developer');
    expect(role(LIB)).toBe('project-manager');
    expect(role(BANK)).toBeUndefined();
    expect(db.invitations[0]).toMatchObject({
      projectId: BANK,
      email: 'batool.hani@shop-team.com',
    });
  });
});

describe('seed test design chain', () => {
  it('uses well-formed IDs, unique within each project', () => {
    for (const [list, schema] of [
      [db.requirements, RequirementId],
      [db.scenarios, ScenarioId],
      [db.testCases, TestCaseId],
      [db.defects, DefectId],
    ] as const) {
      for (const project of db.projects) {
        const ids = inProject<{ projectId: string; id: string }>(list, project.id).map(
          (entry) => entry.id,
        );
        expect(new Set(ids).size).toBe(ids.length);
        for (const id of ids) expect(schema.safeParse(id).success, id).toBe(true);
      }
    }
  });

  it('only builds approved work on approved work', () => {
    for (const scenario of db.scenarios) {
      const requirement = db.requirements.find(
        (entry) => entry.projectId === scenario.projectId && entry.id === scenario.requirementId,
      );
      expect(requirement, scenario.id).toBeDefined();
      expect(requirement?.status, scenario.id).toBe('approved');
    }
    for (const testCase of db.testCases) {
      const scenario = db.scenarios.find(
        (entry) => entry.projectId === testCase.projectId && entry.id === testCase.scenarioId,
      );
      expect(scenario, testCase.id).toBeDefined();
      if (testCase.status === 'approved') expect(scenario?.status, testCase.id).toBe('approved');
    }
  });

  it('points findings at requirements that exist', () => {
    for (const requirement of db.requirements) {
      for (const finding of requirement.findings) {
        if (!finding.related) continue;
        expect(
          db.requirements.some(
            (entry) => entry.projectId === requirement.projectId && entry.id === finding.related,
          ),
        ).toBe(true);
      }
    }
  });
});

describe('seed runs and defects', () => {
  it('runs only approved test cases, by people who can test', () => {
    for (const entry of db.entries) {
      const testCase = db.testCases.find(
        (record) => record.projectId === entry.projectId && record.id === entry.testCaseId,
      );
      expect(testCase?.status, entry.testCaseId).toBe('approved');
      expect(
        db.runs.some((run) => run.projectId === entry.projectId && run.number === entry.run),
      ).toBe(true);
      if (entry.assigneeId) expect(can(entry.projectId, entry.assigneeId, 'test')).toBe(true);
      expect(entry.steps.length).toBeLessThanOrEqual(testCase?.steps.length ?? 0);
      if (entry.blocked?.defectId) {
        expect(
          db.defects.some(
            (defect) =>
              defect.projectId === entry.projectId && defect.id === entry.blocked?.defectId,
          ),
        ).toBe(true);
      }
    }
  });

  it('assigns defects to people who can fix them, reported by people who can test', () => {
    for (const defect of db.defects) {
      expect(can(defect.projectId, defect.assigneeId, 'fix'), defect.id).toBe(true);
      expect(can(defect.projectId, defect.reporterId, 'test'), defect.id).toBe(true);
      expect(defect.history.at(-1)?.status).toBe(defect.status);
      if (defect.source) {
        const source = defect.source;
        expect(
          db.entries.some(
            (entry) =>
              entry.projectId === defect.projectId &&
              entry.run === source.run &&
              entry.testCaseId === source.testCaseId,
          ),
          defect.id,
        ).toBe(true);
      }
    }
  });

  it('only lets the assignee act on a defect, and keeps a note for every fix and invalid', () => {
    for (const defect of db.defects) {
      for (const event of defect.history) {
        if (['started-fixing', 'marked-fixed', 'marked-invalid'].includes(event.action)) {
          expect(event.actorId, `${defect.id} ${event.action}`).toBe(defect.assigneeId);
        }
      }
      const fixes = defect.history.filter((event) => event.action === 'marked-fixed').length;
      const invalids = defect.history.filter((event) => event.action === 'marked-invalid').length;
      expect(defect.notes).toHaveLength(fixes + invalids);
    }
  });
});

describe('seed coverage', () => {
  it('shows every review status, result, defect status and blocked reason the UI handles', () => {
    const review = new Set(
      [...db.requirements, ...db.scenarios, ...db.testCases].map((entry) => entry.status),
    );
    const results = new Set(db.entries.map((entry) => entry.result));
    const statuses = new Set(db.defects.map((defect) => defect.status));

    expect([...review].sort()).toEqual([...ReviewStatus.options].sort());
    expect([...results].sort()).toEqual([...TestResult.options].sort());
    expect([...statuses].sort()).toEqual([...DefectStatus.options].sort());
    expect(db.entries.some((entry) => entry.blocked?.reason === 'blocked-by-defect')).toBe(true);
    expect(BlockedReason.options).toContain('blocked-by-defect');
    expect(db.entries.some((entry) => entry.readyToRunAgain)).toBe(true);
    expect(db.requirements.some((entry) => entry.status === 'rejected')).toBe(true);
  });

  it('matches the E-Commerce numbers the screens show', () => {
    const requirements = inProject(db.requirements, ECOM);
    const testCases = inProject(db.testCases, ECOM);
    const run12 = db.entries.filter((entry) => entry.projectId === ECOM && entry.run === 12);
    const open = inProject(db.defects, ECOM).filter(
      (defect) => !['closed', 'invalid'].includes(defect.status),
    );
    const count = <T>(list: T[], pick: (entry: T) => boolean) => list.filter(pick).length;
    const findings = requirements.flatMap((entry) => entry.findings);

    expect(requirements).toHaveLength(26);
    expect(count(requirements, (entry) => entry.status === 'approved')).toBe(21);
    expect(count(requirements, (entry) => entry.status === 'pending-review')).toBe(5);
    expect(testCases).toHaveLength(35);
    expect(count(testCases, (entry) => entry.status === 'approved')).toBe(34);
    expect(run12).toHaveLength(34);
    expect(count(run12, (entry) => entry.result === 'passed')).toBe(18);
    expect(count(run12, (entry) => entry.result === 'failed')).toBe(3);
    expect(count(run12, (entry) => entry.result === 'blocked')).toBe(1);
    expect(count(run12, (entry) => entry.result === 'not-run')).toBe(12);
    expect(open).toHaveLength(7);
    expect(open.map((defect) => defect.severity).sort()).toEqual(
      ['critical', 'high', 'high', 'high', 'low', 'medium', 'medium'].sort(),
    );
    expect(findings).toHaveLength(8);
    expect(count(findings, (finding) => !finding.resolved)).toBe(4);
  });

  it('leaves the invited project empty, so its empty states show', () => {
    expect(inProject(db.requirements, BANK)).toHaveLength(0);
    expect(inProject(db.defects, BANK)).toHaveLength(0);
  });
});

describe('seed notifications, activity and jobs', () => {
  it('sends notifications only to members, pointing at things that exist', () => {
    for (const note of db.notifications) {
      expect(
        db.memberships.some(
          (entry) => entry.projectId === note.projectId && entry.personId === note.personId,
        ),
        note.title,
      ).toBe(true);
      const { type, id } = note.target;
      if (type === 'defect') {
        expect(
          db.defects.some((entry) => entry.projectId === note.projectId && entry.id === id),
        ).toBe(true);
      }
      if (type === 'run') {
        expect(
          db.runs.some(
            (entry) => entry.projectId === note.projectId && String(entry.number) === id,
          ),
        ).toBe(true);
      }
      if (type === 'job') expect(db.jobs.some((job) => job.id === id)).toBe(true);
    }
  });

  it('keeps finished jobs with results that match the project', () => {
    const scenarios = db.jobs.find((job) => job.id === 'job-ecom-scenarios')?.result;
    const cases = db.jobs.find((job) => job.id === 'job-ecom-cases')?.result;

    expect(db.jobs.every((job) => job.finished && job.result)).toBe(true);
    expect(scenarios).toMatchObject({ drafted: 13, read: 9, covered: 7 });
    expect(cases).toMatchObject({ drafted: 35, read: 11, covered: 10 });
  });
});

describe('seed times', () => {
  it('uses valid timestamps, none in the future', () => {
    const stamps = [
      ...db.notifications.map((entry) => entry.at),
      ...db.activity.map((entry) => entry.at),
      ...db.defects.flatMap((entry) => entry.history.map((event) => event.at)),
      ...db.runs.map((entry) => entry.startedAt),
      ...db.requirements.flatMap((entry) => entry.history.map((event) => event.at)),
    ];
    for (const stamp of stamps) {
      expect(Timestamp.safeParse(stamp).success, stamp).toBe(true);
      expect(Date.parse(stamp)).toBeLessThanOrEqual(now);
    }
    const days = [...db.entries, ...db.requirements].flatMap((entry) =>
      entry.due ? [entry.due] : [],
    );
    for (const day of days) expect(Day.safeParse(day).success).toBe(true);
  });
});
