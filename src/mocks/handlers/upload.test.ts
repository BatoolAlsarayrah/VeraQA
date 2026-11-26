// @vitest-environment node
// jsdom swaps in its own FormData and File, which Node's fetch can't send, so uploads are tested in Node.
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { request } from '@/lib';
import { Attachment, Job, JobStart, list, RequirementSummary, RunTest } from '@/types';

import { getDb } from '../db';
import { mockServer } from '../server';

mockServer();

beforeAll(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost');
});

function upload(projectId: string, files: [name: string, size: number][]) {
  const form = new FormData();
  for (const [name, size] of files) form.append('files', new File(['x'.repeat(size)], name));
  return request(`/projects/${projectId}/srs`, JobStart, { method: 'POST', form });
}

describe('SRS upload', () => {
  it('analyzes the files together and keeps them as AI drafts', async () => {
    const { jobId } = await upload('e-commerce-portal-v2', [
      ['SRS_v3.pdf', 140_000],
      ['Glossary.txt', 12_000],
    ]);
    const job = await request(`/jobs/${jobId}`, Job);

    expect(job.kind === 'analysis' && job.files).toEqual(['SRS_v3.pdf', 'Glossary.txt']);
    expect(job.steps[0]).toMatchObject({ label: 'Reading 2 files', status: 'done' });
    const pending = await request(
      '/projects/e-commerce-portal-v2/requirements',
      list(RequirementSummary),
      { query: { status: 'pending-review' } },
    );
    expect(pending.items).toHaveLength(11);
    expect(getDb().files.filter((file) => file.name === 'SRS_v3.pdf')).toHaveLength(1);
  });

  it('refuses a file that isn’t PDF, DOCX or TXT, or is over 10 MB', async () => {
    await expect(upload('e-commerce-portal-v2', [['scan.png', 100]])).rejects.toMatchObject({
      status: 422,
      fields: { files: 'scan.png: Use a PDF, DOCX or TXT file.' },
    });
    await expect(
      upload('e-commerce-portal-v2', [['huge.pdf', 10 * 1024 * 1024 + 1]]),
    ).rejects.toMatchObject({
      status: 422,
      fields: { files: 'huge.pdf: Use a file of 10 MB or less.' },
    });
  });

  it('needs a file', async () => {
    await expect(upload('e-commerce-portal-v2', [])).rejects.toMatchObject({
      status: 422,
      fields: { files: 'Choose a file first, or type the requirements in.' },
    });
  });

  it('is only for people who can add requirements', async () => {
    await expect(upload('clinic-booking-app', [['SRS.pdf', 100]])).rejects.toMatchObject({
      status: 403,
    });
    await expect(upload('library-system', [['SRS.pdf', 100]])).resolves.toHaveProperty('jobId');
  });
});

describe('evidence', () => {
  const path = '/projects/e-commerce-portal-v2/runs/12/tests/TC-047/evidence';

  function attach(name: string, size: number, type: string) {
    const form = new FormData();
    form.append('file', new File(['x'.repeat(size)], name, { type }));
    return request(path, Attachment, { method: 'POST', form });
  }

  it('attaches a screenshot to a test in a run', async () => {
    const attachment = await attach('TC-047-step-2.png', 2048, 'image/png');

    expect(attachment).toMatchObject({ name: 'TC-047-step-2.png', size: 2048, type: 'image/png' });
    const test = await request('/projects/e-commerce-portal-v2/runs/12/tests/TC-047', RunTest);
    expect(test.evidence.map((entry) => entry.name)).toEqual(['TC-047-step-2.png']);
  });

  it('takes PNG or JPG images only', async () => {
    await expect(attach('notes.pdf', 100, 'application/pdf')).rejects.toMatchObject({
      status: 422,
      fields: { file: 'Use a PNG or JPG image.' },
    });
  });
});
