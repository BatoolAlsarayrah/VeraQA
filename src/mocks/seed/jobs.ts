import type { ScenarioGenerationResult, TestCaseGenerationResult } from '@/types';

import type { JobRecord, RequirementRecord, ScenarioRecord, TestCaseRecord } from '../db';
import type { Clock } from './clock';
import { ECOM, LIB } from './projects';

type Records = {
  requirements: RequirementRecord[];
  scenarios: ScenarioRecord[];
  testCases: TestCaseRecord[];
};

function done(
  partial: Pick<
    JobRecord,
    'id' | 'projectId' | 'kind' | 'createdBy' | 'startedAt' | 'steps' | 'files' | 'items' | 'result'
  >,
): JobRecord {
  return { ...partial, duration: 8200, cancelled: false, finished: true };
}

function scenarioResult(
  records: Records,
  projectId: string,
  read: string[],
  tooVague: [string, string][],
): ScenarioGenerationResult {
  const requirement = (id: string) => {
    const record = records.requirements.find(
      (entry) => entry.projectId === projectId && entry.id === id,
    );
    if (!record) throw new Error(`Seed job refers to a missing ${id}`);
    return { id, title: record.title };
  };
  const groups = read
    .map((id) => ({
      requirement: requirement(id),
      scenarios: records.scenarios
        .filter((entry) => entry.projectId === projectId && entry.requirementId === id)
        .map((entry) => ({ id: entry.id, title: entry.title, type: entry.type })),
    }))
    .filter((group) => group.scenarios.length > 0);
  return {
    drafted: groups.reduce((sum, group) => sum + group.scenarios.length, 0),
    read: read.length,
    covered: groups.length,
    tooVague: tooVague.map(([id, reason]) => ({ requirement: requirement(id), reason })),
    groups,
  };
}

function testCaseResult(
  records: Records,
  projectId: string,
  read: string[],
  needsTestData: [string, string][],
): TestCaseGenerationResult {
  const scenario = (id: string) => {
    const record = records.scenarios.find(
      (entry) => entry.projectId === projectId && entry.id === id,
    );
    if (!record) throw new Error(`Seed job refers to a missing ${id}`);
    return { id, title: record.title };
  };
  const groups = read
    .map((id) => ({
      scenario: scenario(id),
      testCases: records.testCases
        .filter((entry) => entry.projectId === projectId && entry.scenarioId === id)
        .map((entry) => ({ id: entry.id, title: entry.title, type: entry.type })),
    }))
    .filter((group) => group.testCases.length > 0);
  return {
    drafted: groups.reduce((sum, group) => sum + group.testCases.length, 0),
    read: read.length,
    covered: groups.length,
    needsTestData: needsTestData.map(([id, reason]) => ({ scenario: scenario(id), reason })),
    groups,
  };
}

const analysisSteps = (files: string) => [
  { label: `Reading ${files}`, detail: '22 pages, 4,870 words' },
  { label: 'Splitting them into requirements', detail: '26 requirements found in 9 sections' },
  {
    label: 'Checking each one',
    detail: '4 ambiguous, 2 missing information, 2 possible contradictions',
  },
  { label: 'Drafting suggested rewrites', detail: '2 suggestions, all saved as drafts' },
];

const scenarioSteps = [
  { label: 'Reading the approved requirements', detail: null },
  { label: 'Drafting scenarios', detail: null },
  { label: 'Linking each scenario to its requirement', detail: null },
  { label: 'Saving them as AI drafts', detail: null },
];

const testCaseSteps = [
  { label: 'Reading the approved scenarios', detail: null },
  { label: 'Writing steps and test data', detail: null },
  { label: 'Linking each test case to its scenario', detail: null },
  { label: 'Saving them as AI drafts', detail: null },
];

export function jobs(t: Clock, records: Records): JobRecord[] {
  const ecomRequirements = [
    'REQ-005',
    'REQ-010',
    'REQ-011',
    'REQ-013',
    'REQ-014',
    'REQ-019',
    'REQ-021',
    'REQ-022',
    'REQ-026',
  ];
  const ecomScenarios = [
    'SC-001',
    'SC-002',
    'SC-003',
    'SC-005',
    'SC-006',
    'SC-007',
    'SC-008',
    'SC-010',
    'SC-011',
    'SC-012',
    'SC-013',
  ];
  const libRequirements = ['REQ-001', 'REQ-002', 'REQ-003', 'REQ-005', 'REQ-007'];

  return [
    done({
      id: 'job-ecom-analysis',
      projectId: ECOM,
      kind: 'analysis',
      createdBy: 'batool-hani',
      startedAt: t.ago(72),
      steps: analysisSteps('2 files'),
      files: ['SRS_v2.pdf', 'NFR_addendum.docx'],
      items: [],
      result: {
        requirements: 26,
        sections: 9,
        ambiguous: 4,
        missingInformation: 2,
        contradictions: 2,
        rewrites: 2,
      },
    }),
    done({
      id: 'job-ecom-scenarios',
      projectId: ECOM,
      kind: 'scenario-generation',
      createdBy: 'batool-hani',
      startedAt: t.daysAgo(3, 15),
      steps: scenarioSteps,
      files: [],
      items: ecomRequirements,
      result: scenarioResult(records, ECOM, ecomRequirements, [
        ['REQ-021', 'Too vague to test. Say what “easy to use” means in steps someone can check.'],
        ['REQ-022', 'Too vague to test. Say how long “fast” is, in seconds.'],
      ]),
    }),
    done({
      id: 'job-ecom-cases',
      projectId: ECOM,
      kind: 'test-case-generation',
      createdBy: 'batool-hani',
      startedAt: t.daysAgo(2, 9, 40),
      steps: testCaseSteps,
      files: [],
      items: ecomScenarios,
      result: testCaseResult(records, ECOM, ecomScenarios, [
        [
          'SC-002',
          'The AI needs an account that’s already registered to test against. Add it as test data, then generate again.',
        ],
      ]),
    }),
    done({
      id: 'job-lib-scenarios',
      projectId: LIB,
      kind: 'scenario-generation',
      createdBy: 'batool-hani',
      startedAt: t.daysAgo(22),
      steps: scenarioSteps,
      files: [],
      items: libRequirements,
      result: scenarioResult(records, LIB, libRequirements, []),
    }),
  ];
}
