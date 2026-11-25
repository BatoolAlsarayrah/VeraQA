import { Outlet, useLocation, useMatches } from 'react-router';

import { AppShell, Sidebar, TopBar } from '@/components/layout';
import { useCollapsedRail, useProject } from '@/hooks';
import type { Capability } from '@/types';

import { deepestHandle, resolve } from './handle';

export function ShellRoute() {
  const { pathname } = useLocation();
  const project = useProject();
  const found = deepestHandle(useMatches());
  const { collapsed, toggle } = useCollapsedRail();
  const can = (capability: Capability) => project?.capabilities.includes(capability) ?? false;
  const handle = found?.handle;
  const crumb = handle ? resolve(handle.crumb ?? handle.title, found.params, can) : '';

  return (
    <AppShell
      narrow={handle?.narrow ?? false}
      pageKey={pathname}
      sidebar={<Sidebar collapsed={collapsed} onToggle={toggle} />}
      top={<TopBar stage={handle?.stage} crumb={crumb} />}
    >
      <Outlet />
    </AppShell>
  );
}
