import { redirect } from 'react-router';

import { HttpError, paths, queryClient, sessionQuery } from '@/lib';

export async function requireSession() {
  try {
    await queryClient.ensureQueryData(sessionQuery);
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) return redirect(paths.signin);
    throw error;
  }
  return null;
}
