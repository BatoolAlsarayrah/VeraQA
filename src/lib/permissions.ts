import type { Capability, Role } from '@/types';

import { paths } from './paths';

// The live API sends each membership's capabilities. Only the fake session and the mock API build them from here.
const table: Record<Role, Capability[]> = {
  'project-manager': [
    'workspace',
    'upload',
    'approve',
    'edit',
    'test',
    'trace',
    'manage',
    'owner',
    'fix',
  ],
  'qa-lead': ['workspace', 'upload', 'approve', 'edit', 'test', 'trace', 'manage'],
  'qa-engineer': ['workspace', 'edit', 'test', 'trace'],
  developer: ['fix'],
};

export const roleLabels: Record<Role, string> = {
  'project-manager': 'Project manager',
  'qa-lead': 'QA lead',
  'qa-engineer': 'QA engineer',
  developer: 'Developer',
};

export function capabilitiesFor(role: Role): Capability[] {
  return [...table[role]];
}

export function homePath(projectId: string, capabilities: Capability[]) {
  return capabilities.includes('workspace') ? paths.dashboard(projectId) : paths.defects(projectId);
}
