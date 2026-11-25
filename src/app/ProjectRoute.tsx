import { useEffect } from 'react';
import { Navigate, Outlet, useMatches, useParams } from 'react-router';

import { useSession } from '@/hooks';
import { homePath, paths, setCurrentProject } from '@/lib';

import { deepestHandle } from './handle';

export function ProjectRoute() {
  const { projectId = '' } = useParams();
  const session = useSession();
  const membership = session.memberships.find((entry) => entry.projectId === projectId);
  const need = deepestHandle(useMatches())?.handle.can;

  useEffect(() => {
    if (membership) setCurrentProject(membership.projectId);
  }, [membership]);

  if (!membership) return <Navigate to={paths.projects} replace />;
  if (need && !membership.capabilities.includes(need)) {
    return <Navigate to={homePath(projectId, membership.capabilities)} replace />;
  }
  return <Outlet />;
}
