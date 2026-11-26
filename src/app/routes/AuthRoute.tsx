import { Outlet } from 'react-router';

import { AuthLayout } from '@/components/layout';

export function AuthRoute() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
