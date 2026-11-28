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
import { forgetAnalysis } from '@/features/requirements';
import { useCollapsedRail, useProject } from '@/hooks';
import type { Capability } from '@/types';

import { deepestHandle, resolve } from './handle';
import { useShell } from './useShell';

export function ShellRoute() {
  const { pathname } = useLocation();
  const project = useProject();
  const found = deepestHandle(useMatches());
  const { collapsed, toggle } = useCollapsedRail();
  const can = (capability: Capability) => project?.capabilities.includes(capability) ?? false;
  const projectId = project?.projectId ?? '';
  const { counts, notices, onOpen, analysis } = useShell(projectId, can('upload'));
  const handle = found?.handle;
  const params = found?.params ?? {};
  const crumb = handle ? resolve(handle.crumb ?? handle.title, params, can) : '';
  const back = handle?.back && {
    label: resolve(handle.back.label, params, can),
    to: handle.back.to(params),
  };
  const done = analysis?.status === 'done';
  const reviewed = handle?.stage === 'requirements' && done;
  const result = analysis?.result;

  useEffect(() => {
    if (reviewed) forgetAnalysis(projectId);
  }, [reviewed, projectId]);

  return (
    <AppShell
      narrow={handle?.narrow ?? false}
      pageKey={pathname}
      sidebar={<Sidebar collapsed={collapsed} onToggle={toggle} counts={counts} />}
      top={
        <>
          <TopBar stage={handle?.stage} crumb={crumb} notices={notices} onOpen={onOpen} />
          <PhoneHeader back={back} notices={notices} onOpen={onOpen} />
          {analysis && handle?.stage !== 'srs' && !reviewed && (
            <AnalysisBanner
              projectId={projectId}
              files={analysis.files}
              step={analysis.step + 1}
              total={analysis.steps.length}
              done={done}
              found={{
                requirements: result?.requirements ?? 0,
                issues:
                  (result?.ambiguous ?? 0) +
                  (result?.missingInformation ?? 0) +
                  (result?.contradictions ?? 0),
              }}
            />
          )}
        </>
      }
      bottom={<TabBar counts={counts} />}
    >
      <Outlet />
    </AppShell>
  );
}
