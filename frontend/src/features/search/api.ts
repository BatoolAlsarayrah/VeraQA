import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { keys, request } from '@/lib';
import { list, SearchResult } from '@/types';

export type Filters = {
  q: string;
  type: string;
  status: string;
  priority: string;
  assignee: string;
};

export const searchQuery = (projectId: string, filters: Filters) =>
  queryOptions({
    queryKey: [...keys.project(projectId), 'search', filters],
    queryFn: async () =>
      (
        await request(`/projects/${encodeURIComponent(projectId)}/search`, list(SearchResult), {
          query: filters,
        })
      ).items,
    placeholderData: keepPreviousData,
  });
