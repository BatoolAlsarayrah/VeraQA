import { Outlet, useLocation, useMatches } from 'react-router';

import { AppShell, Sidebar } from '@/components/layout';
import { useCollapsedRail } from '@/hooks';

import { deepestHandle } from './handle';

export function ShellRoute() {
  const { pathname } = useLocation();
  const narrow = deepestHandle(useMatches())?.handle.narrow ?? false;
  const { collapsed, toggle } = useCollapsedRail();

  return (
    <AppShell
      narrow={narrow}
      pageKey={pathname}
      sidebar={<Sidebar collapsed={collapsed} onToggle={toggle} />}
    >
      <Outlet />
    </AppShell>
  );
}
