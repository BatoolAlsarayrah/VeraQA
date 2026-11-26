import { describe, expect, it } from 'vitest';

import { Job } from './job';
import { SrsFile } from './requirement';

const steps = [
  { label: 'Reading 2 files', detail: '22 pages, 4,870 words', status: 'done' },
  { label: 'Splitting it into requirements', detail: null, status: 'running' },
  { label: 'Checking each one', detail: null, status: 'waiting' },
  { label: 'Drafting suggested rewrites', detail: null, status: 'waiting' },
];

const base = {
  id: 'job-1',
  projectId: 'e-commerce-portal-v2',
  status: 'running',
  step: 1,
  steps,
  progress: 0.3,
  startedAt: '2026-11-25T10:10:00.000Z',
  finishedAt: null,
  error: null,
};

describe('Job', () => {
  it('reads a running analysis with its files', () => {
    const job = Job.parse({
      ...base,
      kind: 'analysis',
      files: ['SRS_v2.pdf', 'NFR_addendum.docx'],
      result: null,
    });

    expect(job.kind === 'analysis' && job.files).toHaveLength(2);
  });

  it('reads a finished scenario generation with what was too vague to draft', () => {
    const job = Job.parse({
      ...base,
      status: 'done',
      kind: 'scenario-generation',
      items: [],
      result: {
        drafted: 9,
        read: 21,
        covered: 19,
        tooVague: [
          {
            requirement: { id: 'REQ-021', title: 'Be easy to use' },
            reason: 'Too vague to test.',
          },
        ],
        groups: [
          {
            requirement: {
              id: 'REQ-014',
              title: 'Lock the account for 15 minutes after 5 failed logins',
            },
            scenarios: [
              { id: 'SC-007', title: 'Lock on the 5th failed login in a row', type: 'negative' },
            ],
          },
        ],
      },
    });

    expect(job.kind === 'scenario-generation' && job.result?.tooVague[0]?.requirement.id).toBe(
      'REQ-021',
    );
  });

  it('refuses a result that belongs to another kind of job', () => {
    const result = Job.safeParse({
      ...base,
      kind: 'analysis',
      files: [],
      result: { drafted: 9, read: 21, covered: 19, tooVague: [], groups: [] },
    });

    expect(result.success).toBe(false);
  });
});

describe('SrsFile', () => {
  it('takes PDF, DOCX and TXT files up to 10 MB', () => {
    expect(SrsFile.safeParse({ name: 'SRS_v2.pdf', size: 1_200_000 }).success).toBe(true);
    expect(SrsFile.safeParse({ name: 'Glossary.TXT', size: 12_000 }).success).toBe(true);
    expect(SrsFile.safeParse({ name: 'scan.png', size: 1000 }).error?.issues[0]?.message).toBe(
      'Use a PDF, DOCX or TXT file.',
    );
    expect(
      SrsFile.safeParse({ name: 'big.pdf', size: 11 * 1024 * 1024 }).error?.issues[0]?.message,
    ).toBe('Use a file of 10 MB or less.');
  });
});
