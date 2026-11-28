import { queryOptions } from '@tanstack/react-query';

import { keys, live, request } from '@/lib';
import { Dashboard } from '@/types';

export const dashboardQuery = (projectId: string) =>
  queryOptions({
    queryKey: [...keys.project(projectId), 'dashboard'],
    queryFn: () => request(`/projects/${encodeURIComponent(projectId)}/dashboard`, Dashboard),
    ...live,
  });
