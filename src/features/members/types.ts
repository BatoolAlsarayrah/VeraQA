import { z } from 'zod';

import { InviteRole } from '@/types';

const addresses = (value: string) => value.split(/[,;\s]+/).filter(Boolean);
const isEmail = (value: string) => z.email().safeParse(value).success;

export const InviteForm = z.object({
  emails: z
    .string()
    .refine(
      (value) => addresses(value).length > 0 && addresses(value).every(isEmail),
      'Enter one or more email addresses, like name@company.com, separated by commas.',
    )
    .transform(addresses),
  role: InviteRole,
});
export type InviteForm = z.input<typeof InviteForm>;
