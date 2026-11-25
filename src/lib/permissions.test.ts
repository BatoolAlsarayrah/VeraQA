import { describe, expect, it } from 'vitest';

import { capabilitiesFor, homePath } from './permissions';

describe('capabilitiesFor', () => {
  it('gives the project manager every QA and management capability, but not fix', () => {
    expect(capabilitiesFor('project-manager').sort()).toEqual(
      ['approve', 'edit', 'manage', 'owner', 'test', 'trace', 'upload', 'workspace'].sort(),
    );
  });

  it('gives the QA lead the same without the danger zone', () => {
    expect(capabilitiesFor('qa-lead')).not.toContain('owner');
    expect(capabilitiesFor('qa-lead').sort()).toEqual(
      ['approve', 'edit', 'manage', 'test', 'trace', 'upload', 'workspace'].sort(),
    );
  });

  it('lets a QA engineer test and edit drafts but not approve, upload or manage', () => {
    expect(capabilitiesFor('qa-engineer').sort()).toEqual(
      ['edit', 'test', 'trace', 'workspace'].sort(),
    );
  });

  it('limits a developer to fixing their defects', () => {
    expect(capabilitiesFor('developer')).toEqual(['fix']);
  });

  it('returns a copy the caller cannot use to change the table', () => {
    capabilitiesFor('developer').push('manage');

    expect(capabilitiesFor('developer')).toEqual(['fix']);
  });
});

describe('homePath', () => {
  it('opens the dashboard for anyone with the workspace', () => {
    expect(homePath('library-system', ['workspace'])).toBe('/projects/library-system/dashboard');
  });

  it('opens the defects list otherwise', () => {
    expect(homePath('payments-api', ['fix'])).toBe('/projects/payments-api/defects');
  });

  it('keeps the project id opaque', () => {
    expect(homePath('Payments API', ['fix'])).toBe('/projects/Payments%20API/defects');
  });
});
