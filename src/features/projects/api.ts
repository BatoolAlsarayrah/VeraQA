import { queryOptions } from '@tanstack/react-query';

import { keys, request } from '@/lib';
import { Counts } from '@/types';

export const countsQuery = (projectId: string) =>
  queryOptions({
    queryKey: [...keys.project(projectId), 'counts'],
    queryFn: () => request(`/projects/${encodeURIComponent(projectId)}/counts`, Counts),
    refetchInterval: 30_000,
  });
