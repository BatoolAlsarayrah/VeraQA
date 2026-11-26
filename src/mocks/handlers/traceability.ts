import type { Trace } from '@/types';

import { api } from '../api';
import { inProject } from '../rules';
import { entriesFor, lastResult } from '../work';

export const traceHandlers = [
  api.get('/projects/:projectId/traceability', (context): Trace => {
    const { projectId } = inProject(context, 'trace');
    const { db } = context;
    const inProjectOnly = <T extends { projectId: string }>(list: T[]) =>
      list.filter((entry) => entry.projectId === projectId);
    const requirements = inProjectOnly(db.requirements);
    const scenarios = inProjectOnly(db.scenarios);
    const testCases = inProjectOnly(db.testCases);
    const defects = inProjectOnly(db.defects);
    const defectsOf = (testCaseId: string) =>
      defects
        .filter((defect) => defect.source?.testCaseId === testCaseId)
        .map((defect) => ({ id: defect.id, title: defect.title, status: defect.status }));
    const approvedCases = testCases.filter((entry) => entry.status === 'approved');

    return {
      requirements: requirements
        .filter((requirement) => requirement.status === 'approved')
        .map((requirement) => ({
          id: requirement.id,
          title: requirement.title,
          text: requirement.text,
          scenarios: scenarios
            .filter((scenario) => scenario.requirementId === requirement.id)
            .map((scenario) => ({
              id: scenario.id,
              title: scenario.title,
              status: scenario.status,
              testCases: testCases
                .filter((testCase) => testCase.scenarioId === scenario.id)
                .map((testCase) => ({
                  id: testCase.id,
                  title: testCase.title,
                  status: testCase.status,
                  lastResult: lastResult(db, projectId, testCase.id),
                  defects: defectsOf(testCase.id),
                })),
            })),
        })),
      gaps: {
        failedOrBlocked: approvedCases.flatMap((testCase) => {
          const result = lastResult(db, projectId, testCase.id);
          if (result !== 'failed' && result !== 'blocked') return [];
          const blockedEntry = entriesFor(db, projectId, testCase.id).find(
            (entry) => entry.result === 'blocked',
          );
          const blocking = defects.find((defect) => defect.id === blockedEntry?.blocked?.defectId);
          return [
            {
              id: testCase.id,
              title: testCase.title,
              result,
              blockedBy:
                result === 'blocked' && blocking
                  ? { id: blocking.id, title: blocking.title, status: blocking.status }
                  : null,
            },
          ];
        }),
        scenariosWithoutTests: scenarios
          .filter(
            (scenario) =>
              scenario.status === 'approved' &&
              !testCases.some((testCase) => testCase.scenarioId === scenario.id),
          )
          .map((scenario) => ({ id: scenario.id, title: scenario.title })),
        notRun: approvedCases
          .filter((testCase) => lastResult(db, projectId, testCase.id) === 'not-run')
          .map((testCase) => ({ id: testCase.id, title: testCase.title })),
        pendingRequirements: requirements.filter((entry) => entry.status === 'pending-review')
          .length,
      },
    };
  }),
];
