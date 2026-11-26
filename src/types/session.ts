import { z } from 'zod';

import { PersonId, ProjectId } from './common';

export const Role = z.enum(['project-manager', 'qa-lead', 'qa-engineer', 'developer']);
export type Role = z.infer<typeof Role>;

export const Capability = z.enum([
  'workspace',
  'upload',
  'approve',
  'edit',
  'test',
  'trace',
  'manage',
  'owner',
  'fix',
]);
export type Capability = z.infer<typeof Capability>;

export const User = z.object({
  id: PersonId,
  name: z.string().min(1),
  email: z.email(),
});
export type User = z.infer<typeof User>;

export const Membership = z.object({
  projectId: ProjectId,
  projectName: z.string().min(1),
  role: Role,
  capabilities: z.array(Capability),
});
export type Membership = z.infer<typeof Membership>;

export const Session = z.object({
  user: User,
  memberships: z.array(Membership),
});
export type Session = z.infer<typeof Session>;

const password = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .regex(/\d/, 'Add at least one number.');

export const SignInInput = z.object({
  email: z.email('Enter an email address, like name@company.com.'),
  password: z.string().min(1, 'Enter your password.'),
});
export type SignInInput = z.infer<typeof SignInInput>;

export const RegisterInput = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name.'),
  lastName: z.string().trim().min(1, 'Enter your last name.'),
  email: z.email('Enter an email address, like name@company.com.'),
  password,
});
export type RegisterInput = z.infer<typeof RegisterInput>;

export const ForgotPasswordInput = z.object({
  email: z.email('Enter an email address, like name@company.com.'),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInput>;

export const ProfileInput = RegisterInput.pick({ firstName: true, lastName: true, email: true });
export type ProfileInput = z.infer<typeof ProfileInput>;

export const PasswordInput = z.object({
  current: z.string().min(1, 'Enter your current password.'),
  next: password,
});
export type PasswordInput = z.infer<typeof PasswordInput>;
