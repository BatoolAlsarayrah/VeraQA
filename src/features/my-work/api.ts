import { queryOptions } from '@tanstack/react-query';

import { keys, live, request } from '@/lib';
import { MyWork } from '@/types';

export const myWorkQuery = (projectId: string) =>
  queryOptions({
    queryKey: [...keys.project(projectId), 'my-work'],
    queryFn: () => request(`/projects/${encodeURIComponent(projectId)}/my-work`, MyWork),
    ...live,
  });
