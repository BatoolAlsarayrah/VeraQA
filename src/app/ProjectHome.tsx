import { Navigate } from 'react-router';

import { useProject } from '@/hooks';
import { homePath, paths } from '@/lib';

export function ProjectHome() {
  const project = useProject();
  if (!project) return <Navigate to={paths.projects} replace />;
  return <Navigate to={homePath(project.projectId, project.capabilities)} replace />;
}
