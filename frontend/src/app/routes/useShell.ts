import { useQuery } from '@tanstack/react-query';

import {
  notificationPath,
  notificationsQuery,
  useReadNotification,
} from '@/features/notifications';
import { countsQuery } from '@/features/projects';
import { useAnalysis } from '@/features/requirements';
import { when } from '@/lib';

export function useShell(projectId: string, canUpload: boolean) {
  const counts = useQuery(countsQuery(projectId));
  const notifications = useQuery(notificationsQuery(projectId));
  const read = useReadNotification(projectId);
  const analysis = useAnalysis(projectId, canUpload);
  const now = notifications.dataUpdatedAt;

  return {
    counts: counts.data,
    notices: (notifications.data?.items ?? []).map((entry) => ({
      id: entry.id,
      title: entry.title,
      detail: entry.detail,
      time: when(entry.at, now),
      to: notificationPath(projectId, entry.target),
      unread: entry.unread,
    })),
    onOpen: (id: string) => read.mutate(id),
    analysis,
  };
}
