import { z } from 'zod';

import { PersonId } from './common';
import { Capability, Role } from './session';

export const Member = z.object({
  id: PersonId,
  name: z.string().min(1),
  role: Role,
  capabilities: z.array(Capability),
  email: z.email().optional(),
  status: z.enum(['active', 'invited']).optional(),
  workload: z
    .object({
      assigned: z.number().int().nonnegative(),
      done: z.number().int().nonnegative(),
      unit: z.enum(['items', 'defects']),
    })
    .optional(),
});
export type Member = z.infer<typeof Member>;

export const InviteRole = Role.exclude(['project-manager']);
export type InviteRole = z.infer<typeof InviteRole>;

export const InviteInput = z.object({
  emails: z
    .array(z.email('Check the email addresses. Use name@company.com, separated by commas.'))
    .min(1, 'Enter at least one email address.'),
  role: InviteRole,
});
export type InviteInput = z.infer<typeof InviteInput>;

export const RoleInput = z.object({ role: InviteRole });
export type RoleInput = z.infer<typeof RoleInput>;
