import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet, useSearchParams } from 'react-router';

import { returnTo, sessionQuery } from '@/lib';

export function SignedOutRoute() {
  const session = useQuery(sessionQuery);
  const [params] = useSearchParams();

  if (session.data) return <Navigate to={returnTo(params.get('from'))} replace />;
  return <Outlet />;
}
