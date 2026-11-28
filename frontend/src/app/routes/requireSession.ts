import { type LoaderFunctionArgs, redirect } from 'react-router';

import { HttpError, queryClient, sessionQuery, signinFrom } from '@/lib';

export async function requireSession({ request }: LoaderFunctionArgs) {
  try {
    await queryClient.ensureQueryData(sessionQuery);
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) {
      const url = new URL(request.url);
      return redirect(signinFrom(url.pathname + url.search));
    }
    throw error;
  }
  return null;
}
