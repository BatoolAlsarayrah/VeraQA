import { Outlet, useLocation } from 'react-router';

import { AccountMenu, SoloLayout } from '@/components/layout';
import { useSession } from '@/hooks';

export function SoloRoute() {
  const { pathname } = useLocation();
  const { user } = useSession();

  return (
    <SoloLayout pageKey={pathname} end={<AccountMenu user={user} solo />}>
      <Outlet />
    </SoloLayout>
  );
}
