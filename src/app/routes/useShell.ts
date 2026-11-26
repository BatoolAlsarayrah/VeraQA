import { useQuery } from '@tanstack/react-query';

import { notificationsQuery, useReadNotification } from '@/features/notifications';
import { countsQuery } from '@/features/projects';
import { useAnalysis } from '@/features/requirements';
import { paths, when } from '@/lib';
import type { Notification } from '@/types';

function link(projectId: string, { type, id }: Notification['target']) {
  const job = id ? `?job=${encodeURIComponent(id)}` : '';
  switch (type) {
    case 'requirement':
      return id ? paths.requirement(projectId, id) : paths.requirements(projectId);
    case 'requirements':
      return paths.requirements(projectId);
    case 'scenario':
      return id ? paths.scenario(projectId, id) : paths.scenarios(projectId);
    case 'scenarios':
      return paths.scenarios(projectId);
    case 'test-case':
      return id ? paths.testCase(projectId, id) : paths.testCases(projectId);
    case 'test-cases':
      return paths.testCases(projectId);
    case 'run':
      return id ? paths.run(projectId, id) : paths.runs(projectId);
    case 'defect':
      return id ? paths.defect(projectId, id) : paths.defects(projectId);
    case 'my-work':
      return paths.myWork(projectId);
    case 'members':
      return paths.members(projectId);
    case 'analysis':
      return paths.analysis(projectId) + job;
    case 'scenario-generation':
      return paths.generateScenarios(projectId) + job;
    case 'test-case-generation':
      return paths.generateTestCases(projectId) + job;
  }
}

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
      to: link(projectId, entry.target),
      unread: entry.unread,
    })),
    onOpen: (id: string) => read.mutate(id),
    analysis,
  };
}
