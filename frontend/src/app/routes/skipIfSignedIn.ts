import { type LoaderFunctionArgs, redirect } from 'react-router';

import { keys, queryClient, returnTo } from '@/lib';

// Only the cache is read, so a known session skips the form at once and an unknown one shows the
// form without waiting; SignedOutRoute handles a session that answers later.
export function skipIfSignedIn({ request }: LoaderFunctionArgs) {
  if (!queryClient.getQueryData(keys.session)) return null;
  return redirect(returnTo(new URL(request.url).searchParams.get('from')));
}
