import { useSyncExternalStore } from 'react';
import { useParams } from 'react-router';

import { getCurrentProject, subscribeCurrentProject } from '@/lib';

import { useSession } from './useSession';

export function useProject() {
  const { memberships } = useSession();
  const current = useSyncExternalStore(subscribeCurrentProject, getCurrentProject);
  const { projectId } = useParams();
  const id = projectId ?? current;
  return memberships.find((entry) => entry.projectId === id) ?? memberships[0] ?? null;
}
