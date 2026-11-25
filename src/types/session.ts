export type Role = 'project-manager' | 'qa-lead' | 'qa-engineer' | 'developer';

export type Capability =
  'workspace' | 'upload' | 'approve' | 'edit' | 'test' | 'trace' | 'manage' | 'owner' | 'fix';

export type User = {
  name: string;
  email: string;
};

export type Membership = {
  projectId: string;
  projectName: string;
  role: Role;
  capabilities: Capability[];
};

export type Session = {
  user: User;
  memberships: Membership[];
  currentProjectId: string;
};
