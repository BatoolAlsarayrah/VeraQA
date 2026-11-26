import { useQuery } from '@tanstack/react-query';
import { Outlet, useLocation } from 'react-router';

import { AccountMenu, SoloLayout } from '@/components/layout';
import { sessionQuery } from '@/lib';

export function SoloRoute() {
  const { pathname } = useLocation();
  const session = useQuery(sessionQuery);
  const user = session.data?.user;

  return (
    <SoloLayout pageKey={pathname} end={user && <AccountMenu user={user} solo />}>
      <Outlet />
    </SoloLayout>
  );
}
