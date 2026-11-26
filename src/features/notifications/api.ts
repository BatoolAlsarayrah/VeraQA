import { queryOptions, useMutation } from '@tanstack/react-query';

import { keys, none, queryClient, request } from '@/lib';
import { list, Notification } from '@/types';

export const notificationsQuery = (projectId: string) =>
  queryOptions({
    queryKey: keys.notifications(projectId),
    queryFn: () => request('/notifications', list(Notification), { query: { projectId } }),
    refetchInterval: 30_000,
  });

export function useReadNotification(projectId: string) {
  return useMutation({
    mutationFn: (id: string) =>
      request(`/notifications/${encodeURIComponent(id)}/read`, none, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.notifications(projectId) }),
  });
}
