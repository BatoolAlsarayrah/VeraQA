import { queryOptions } from '@tanstack/react-query';

import { forgetSession, keys, none, queryClient, request } from '@/lib';
import {
  type ForgotPasswordInput,
  type RegisterInput,
  type ResetPasswordInput,
  Session,
  type SignInInput,
} from '@/types';

function start(session: Session) {
  forgetSession();
  queryClient.setQueryData(keys.session, session);
  return session;
}

export async function signIn(input: SignInInput) {
  return start(await request('/auth/sign-in', Session, { method: 'POST', body: input }));
}

export async function register(input: RegisterInput) {
  return start(await request('/auth/register', Session, { method: 'POST', body: input }));
}

export function askForReset(input: ForgotPasswordInput) {
  return request('/auth/forgot-password', none, { method: 'POST', body: input });
}

export const resetLinkQuery = (token: string) =>
  queryOptions({
    queryKey: ['reset-link', token],
    queryFn: async () => {
      await request(`/auth/reset-password/${encodeURIComponent(token)}`, none);
      return true;
    },
    staleTime: Infinity,
  });

export async function resetPassword(input: ResetPasswordInput) {
  await request('/auth/reset-password', none, { method: 'POST', body: input });
  forgetSession();
}
