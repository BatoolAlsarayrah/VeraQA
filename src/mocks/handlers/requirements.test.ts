import { describe, expect, it } from 'vitest';

import { request } from '@/lib';
import { Approved, list, Requirement, RequirementSummary } from '@/types';

import { getDb } from '../db';
import { mockServer } from '../server';

mockServer();

const BASE = '/projects/e-commerce-portal-v2/requirements';
const get = (id: string) => request(`${BASE}/${id}`, Requirement);
const post = (path: string, body?: unknown) =>
  request(`${BASE}/${path}`, Requirement, { method: 'POST', body });

describe('requirement lists', () => {
  it('lists the project’s requirements with simple filters', async () => {
    const all = await request(BASE, list(RequirementSummary));
    const pending = await request(BASE, list(RequirementSummary), {
      query: { status: 'pending-review' },
    });
    const mine = await request(BASE, list(RequirementSummary), { query: { assignee: 'me' } });
    const lock = await request(BASE, list(RequirementSummary), { query: { search: 'LOCK' } });

    expect(all.items).toHaveLength(26);
    expect(pending.items.map((entry) => entry.id)).toEqual([
      'REQ-012',
      'REQ-015',
      'REQ-018',
      'REQ-020',
      'REQ-023',
    ]);
    expect(mine.items.map((entry) => entry.id)).toEqual(['REQ-015', 'REQ-018', 'REQ-020']);
    expect(lock.items.map((entry) => entry.id)).toContain('REQ-014');
  });

  it('refuses requirements to a developer', async () => {
    await expect(
      request('/projects/payments-api/requirements', list(RequirementSummary)),
    ).rejects.toMatchObject({ status: 403 });
  });
});

describe('requirement detail', () => {
  it('shows the findings, the rewrite and where it came from', async () => {
    const requirement = await get('REQ-015');

    expect(requirement.openFindings).toBe(3);
    expect(requirement.findings.find((finding) => finding.kind === 'contradiction')?.related).toBe(
      'REQ-014',
    );
    expect(requirement.rewrite?.text).toMatch(/valid for 1 hour/);
    expect(requirement.source).toMatchObject({ file: 'SRS_v2.pdf', page: 7 });
    expect(requirement.origin).toBe('ai');
  });

  it('lists the scenarios built on it', async () => {
    const requirement = await get('REQ-014');

    expect(requirement.scenarios.map((entry) => [entry.id, entry.status])).toEqual([
      ['SC-007', 'approved'],
      ['SC-008', 'approved'],
      ['SC-009', 'pending-review'],
    ]);
  });

  it('answers 404 for an ID that doesn’t exist', async () => {
    await expect(get('REQ-099')).rejects.toMatchObject({ status: 404 });
  });
});

describe('reviewing requirements', () => {
  it('approves once, and logs who did it', async () => {
    const requirement = await post('REQ-012/approve');

    expect(requirement).toMatchObject({
      status: 'approved',
      decidedBy: { name: 'Batool Hani' },
    });
    expect(getDb().activity[0]).toMatchObject({
      action: 'approved',
      item: { id: 'REQ-012' },
    });
    await expect(post('REQ-012/approve')).rejects.toMatchObject({ status: 409 });
  });

  it('needs a reason to reject', async () => {
    await expect(post('REQ-023/reject', { reason: '' })).rejects.toMatchObject({
      status: 422,
      fields: { reason: 'Write a reason before you continue.' },
    });

    const requirement = await post('REQ-023/reject', { reason: 'Duplicate of REQ-017.' });
    expect(requirement).toMatchObject({
      status: 'rejected',
      rejectionReason: 'Duplicate of REQ-017.',
    });
  });

  it('won’t reject or reopen a requirement that approved scenarios are built on', async () => {
    await expect(post('REQ-014/reject', { reason: 'Too strict.' })).rejects.toMatchObject({
      status: 409,
    });
    await expect(post('REQ-014/return-to-review')).rejects.toMatchObject({ status: 409 });
  });

  it('returns an approved requirement to review when nothing is built on it', async () => {
    const requirement = await post('REQ-016/return-to-review');

    expect(requirement).toMatchObject({ status: 'pending-review', decidedBy: null });
  });

  it('approves everything pending that has no open findings', async () => {
    const result = await request(`${BASE}/approve-all`, Approved, { method: 'POST' });

    expect(result.approved).toEqual(['REQ-012', 'REQ-020', 'REQ-023']);
  });

  it('sets priority', async () => {
    const requirement = await request(`${BASE}/REQ-015/priority`, Requirement, {
      method: 'PATCH',
      body: { priority: 'high' },
    });

    expect(requirement.priority).toBe('high');
  });
});

describe('editing and AI suggestions', () => {
  it('accepts the suggested rewrite and resolves the findings', async () => {
    const requirement = await post('REQ-018/accept-rewrite');

    expect(requirement).toMatchObject({
      text: 'The cart shall update within 1 second when an item is added.',
      rewrite: null,
      openFindings: 0,
    });
    await expect(post('REQ-012/accept-rewrite')).rejects.toMatchObject({ status: 409 });
  });

  it('resolves one finding at a time', async () => {
    const requirement = await post('REQ-015/findings/1/resolve');

    expect(requirement.openFindings).toBe(2);
    await expect(post('REQ-015/findings/9/resolve')).rejects.toMatchObject({ status: 404 });
  });

  it('lets a QA engineer edit a draft but not approve it', async () => {
    const clinic = '/projects/clinic-booking-app/requirements';
    const edited = await request(`${clinic}/REQ-011`, Requirement, {
      method: 'PATCH',
      body: {
        title: 'Turn reminders off',
        text: 'Patients shall be able to turn appointment reminders off in their settings.',
        section: 'Reminders',
        type: 'functional',
      },
    });

    expect(edited.text).toMatch(/in their settings/);
    await expect(
      request(`${clinic}/REQ-011/approve`, Requirement, { method: 'POST' }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('won’t edit an approved requirement, and sends an edited rejected one back to review', async () => {
    const clinic = '/projects/clinic-booking-app/requirements';
    const body = {
      title: 'Work on supported devices',
      text: 'The system shall work on Chrome, Safari and Firefox, at 360px wide and up.',
      section: 'General',
      type: 'non-functional',
    };

    await expect(
      request(`${clinic}/REQ-001`, Requirement, { method: 'PATCH', body }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      request(`${clinic}/REQ-012`, Requirement, { method: 'PATCH', body }),
    ).resolves.toMatchObject({ status: 'pending-review', rejectionReason: null });
  });
});
