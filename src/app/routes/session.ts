import { type LoaderFunctionArgs, redirect } from 'react-router';

import { HttpError, keys, queryClient, returnTo, sessionQuery, signinFrom } from '@/lib';

function here(request: Request) {
  const url = new URL(request.url);
  return url.pathname + url.search;
}

export async function requireSession({ request }: LoaderFunctionArgs) {
  try {
    await queryClient.ensureQueryData(sessionQuery);
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) {
      return redirect(signinFrom(here(request)));
    }
    throw error;
  }
  return null;
}

// Only the cache is read, so a known session skips the form at once and an unknown one shows the
// form without waiting; SignedOutRoute handles a session that answers later.
export function skipIfSignedIn({ request }: LoaderFunctionArgs) {
  if (!queryClient.getQueryData(keys.session)) return null;
  return redirect(returnTo(new URL(request.url).searchParams.get('from')));
}
