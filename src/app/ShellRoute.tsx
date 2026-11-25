import { Outlet, useLocation, useMatches } from 'react-router';

import { AppShell, PhoneHeader, Sidebar, TabBar, TopBar } from '@/components/layout';
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
  const params = found?.params ?? {};
  const crumb = handle ? resolve(handle.crumb ?? handle.title, params, can) : '';
  const back = handle?.back && {
    label: resolve(handle.back.label, params, can),
    to: handle.back.to(params),
  };

  return (
    <AppShell
      narrow={handle?.narrow ?? false}
      pageKey={pathname}
      sidebar={<Sidebar collapsed={collapsed} onToggle={toggle} />}
      top={
        <>
          <TopBar stage={handle?.stage} crumb={crumb} />
          <PhoneHeader back={back} />
        </>
      }
      bottom={<TabBar />}
    >
      <Outlet />
    </AppShell>
  );
}
