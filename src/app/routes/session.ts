import { type LoaderFunctionArgs, redirect } from 'react-router';

import { HttpError, queryClient, sessionQuery, signinFrom } from '@/lib';

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
