import { forgetSession, keys, queryClient, request } from '@/lib';
import { type RegisterInput, Session, type SignInInput } from '@/types';

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
