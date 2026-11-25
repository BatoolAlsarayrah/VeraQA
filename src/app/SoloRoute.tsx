import { Outlet, useLocation } from 'react-router';

import { SoloLayout } from '@/components/layout';

export function SoloRoute() {
  const { pathname } = useLocation();

  return (
    <SoloLayout pageKey={pathname}>
      <Outlet />
    </SoloLayout>
  );
}
