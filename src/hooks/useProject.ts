import { useParams } from 'react-router';

import { useSession } from './useSession';

export function useProject() {
  const session = useSession();
  const { projectId = session.currentProjectId } = useParams();
  return session.memberships.find((entry) => entry.projectId === projectId) ?? null;
}
