import { keys, queryClient, request } from '@/lib';
import { Session, type SignInInput } from '@/types';

function start(session: Session) {
  queryClient.clear();
  queryClient.setQueryData(keys.session, session);
  return session;
}

export async function signIn(input: SignInInput) {
  return start(await request('/auth/sign-in', Session, { method: 'POST', body: input }));
}
