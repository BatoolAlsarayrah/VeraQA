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
  .min(8, 'That password is too short. Use at least 8 characters, with a number.')
  .regex(/\d/, 'Add a number. Use at least 8 characters, with a number.');

export const SignInInput = z.object({
  email: z.email('Enter an email like name@company.com.'),
  password: z.string().min(1, 'Enter your password.'),
});
export type SignInInput = z.infer<typeof SignInInput>;

export const RegisterInput = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name.'),
  lastName: z.string().trim().min(1, 'Enter your last name.'),
  email: z.email('Enter an email like name@company.com.'),
  password,
});
export type RegisterInput = z.infer<typeof RegisterInput>;

export const ForgotPasswordInput = z.object({
  email: z.email('Enter an email like name@company.com.'),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInput>;

export const ResetPasswordInput = z.object({
  token: z.string().min(1),
  password,
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordInput>;

export const NewPassword = z
  .object({ password, confirm: z.string() })
  .refine((value) => value.password === value.confirm, {
    path: ['confirm'],
    message: 'The two passwords don’t match. Type the new one again.',
  });
export type NewPassword = z.infer<typeof NewPassword>;

export const ProfileInput = RegisterInput.pick({ firstName: true, lastName: true, email: true });
export type ProfileInput = z.infer<typeof ProfileInput>;

export const PasswordInput = z.object({
  current: z.string().min(1, 'Enter your current password.'),
  next: password,
});
export type PasswordInput = z.infer<typeof PasswordInput>;
