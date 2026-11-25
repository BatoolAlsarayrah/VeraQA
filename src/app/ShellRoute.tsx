import { useEffect } from 'react';
import { Outlet, useLocation, useMatches } from 'react-router';

import {
  AnalysisBanner,
  AppShell,
  PhoneHeader,
  Sidebar,
  TabBar,
  TopBar,
} from '@/components/layout';
import { useAnalysis, useCollapsedRail, useProject } from '@/hooks';
import { setDemoAnalysis } from '@/lib';
import type { Capability } from '@/types';

import { deepestHandle, resolve } from './handle';

export function ShellRoute() {
  const { pathname } = useLocation();
  const project = useProject();
  const found = deepestHandle(useMatches());
  const { collapsed, toggle } = useCollapsedRail();
  const analysis = useAnalysis();
  const can = (capability: Capability) => project?.capabilities.includes(capability) ?? false;
  const handle = found?.handle;
  const params = found?.params ?? {};
  const crumb = handle ? resolve(handle.crumb ?? handle.title, params, can) : '';
  const back = handle?.back && {
    label: resolve(handle.back.label, params, can),
    to: handle.back.to(params),
  };
  const reviewed = handle?.stage === 'requirements' && analysis?.done === true;
  const showBanner = analysis && project && can('upload') && handle?.stage !== 'srs' && !reviewed;

  useEffect(() => {
    if (reviewed) setDemoAnalysis(null);
  }, [reviewed]);

  return (
    <AppShell
      narrow={handle?.narrow ?? false}
      pageKey={pathname}
      sidebar={<Sidebar collapsed={collapsed} onToggle={toggle} />}
      top={
        <>
          <TopBar stage={handle?.stage} crumb={crumb} />
          <PhoneHeader back={back} />
          {showBanner && <AnalysisBanner projectId={project.projectId} {...analysis} />}
        </>
      }
      bottom={<TabBar />}
    >
      <Outlet />
    </AppShell>
  );
}
