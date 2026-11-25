import { Outlet, useLocation, useMatches } from 'react-router';

import { AppShell } from '@/components/layout';

import { deepestHandle } from './handle';

export function ShellRoute() {
  const { pathname } = useLocation();
  const narrow = deepestHandle(useMatches())?.handle.narrow ?? false;

  return (
    <AppShell narrow={narrow} pageKey={pathname}>
      <Outlet />
    </AppShell>
  );
}
