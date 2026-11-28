import { queryOptions } from '@tanstack/react-query';

import { keys, live, none, queryClient, request } from '@/lib';
import {
  type AssignmentInput,
  type Capability,
  DefectSummary,
  list,
  MyWork,
  type Priority,
  RequirementSummary,
  ScenarioSummary,
  TestCaseSummary,
} from '@/types';

export const myWorkQuery = (projectId: string) =>
  queryOptions({
    queryKey: [...keys.project(projectId), 'my-work'],
    queryFn: () => request(`/projects/${encodeURIComponent(projectId)}/my-work`, MyWork),
    ...live,
  });

export type Pickable = {
  type: 'requirement' | 'scenario' | 'test-case' | 'defect';
  id: string;
  title: string;
  priority: Priority | null;
  needs: Capability;
};

const at = (projectId: string, path: string) =>
  `/projects/${encodeURIComponent(projectId)}/${path}`;

type Summary = { id: string; title: string; priority: Priority | null };

const pick = (
  type: Pickable['type'],
  { id, title, priority }: Summary,
  needs: Capability,
): Pickable => ({ type, id, title, priority, needs });

async function pickable(projectId: string, type: Pickable['type']): Promise<Pickable[]> {
  if (type === 'requirement') {
    const { items } = await request(at(projectId, 'requirements'), list(RequirementSummary), {
      query: { status: 'pending-review' },
    });
    return items.map((item) => pick(type, item, 'approve'));
  }
  if (type === 'scenario') {
    const { items } = await request(at(projectId, 'scenarios'), list(ScenarioSummary), {
      query: { status: 'pending-review' },
    });
    return items.map((item) => pick(type, item, 'approve'));
  }
  if (type === 'test-case') {
    const { items } = await request(at(projectId, 'test-cases'), list(TestCaseSummary));
    return items
      .filter((item) => item.status !== 'rejected')
      .map((item) => pick(type, item, item.status === 'approved' ? 'test' : 'approve'));
  }
  const { items } = await request(at(projectId, 'defects'), list(DefectSummary));
  return items
    .filter((item) => ['open', 'in-progress', 'reopened'].includes(item.status))
    .map((item) => pick(type, { ...item, priority: item.severity }, 'fix'));
}

export const pickableQuery = (projectId: string, type: Pickable['type']) =>
  queryOptions({
    queryKey: [...keys.project(projectId), 'pickable', type],
    queryFn: () => pickable(projectId, type),
  });

export async function assign(projectId: string, input: AssignmentInput) {
  await request(at(projectId, 'assignments'), none, { method: 'POST', body: input });
  await queryClient.invalidateQueries({ queryKey: keys.project(projectId) });
}
