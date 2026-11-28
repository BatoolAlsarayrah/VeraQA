import { queryOptions, useMutation } from '@tanstack/react-query';

import { keys, live, none, queryClient, request } from '@/lib';
import { list, Notification } from '@/types';

export const notificationsQuery = (projectId: string) =>
  queryOptions({
    queryKey: keys.notifications(projectId),
    queryFn: () => request('/notifications', list(Notification), { query: { projectId } }),
    ...live,
  });

export function useReadNotification(projectId: string) {
  return useMutation({
    mutationFn: (id: string) =>
      request(`/notifications/${encodeURIComponent(id)}/read`, none, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.notifications(projectId) }),
  });
}

export function useReadAll(projectId: string) {
  return useMutation({
    mutationFn: () =>
      request('/notifications/read-all', none, { method: 'POST', query: { projectId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.notifications(projectId) }),
  });
}
