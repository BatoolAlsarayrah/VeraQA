import { queryOptions } from '@tanstack/react-query';

import { keys, none, queryClient, request } from '@/lib';
import { Counts, Invitation, list, Project, type ProjectInput } from '@/types';

export const countsQuery = (projectId: string) =>
  queryOptions({
    queryKey: [...keys.project(projectId), 'counts'],
    queryFn: () => request(`/projects/${encodeURIComponent(projectId)}/counts`, Counts),
    refetchInterval: 30_000,
  });

export const projectsQuery = queryOptions({
  queryKey: keys.projects,
  queryFn: async () => (await request('/projects', list(Project))).items,
});

export const invitationsQuery = queryOptions({
  queryKey: keys.invitations,
  queryFn: async () => (await request('/invitations', list(Invitation))).items,
});

const invitation = (id: string) => `/invitations/${encodeURIComponent(id)}`;

export async function acceptInvitation(id: string) {
  const project = await request(`${invitation(id)}/accept`, Project, { method: 'POST' });
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: keys.session }),
    queryClient.invalidateQueries({ queryKey: keys.projects, exact: true }),
    queryClient.invalidateQueries({ queryKey: keys.invitations }),
  ]);
  return project;
}

export async function declineInvitation(id: string) {
  await request(`${invitation(id)}/decline`, none, { method: 'POST' });
  queryClient.setQueryData(keys.invitations, (items: Invitation[] | undefined) =>
    items?.filter((entry) => entry.id !== id),
  );
}

export async function createProject(input: ProjectInput) {
  const project = await request('/projects', Project, { method: 'POST', body: input });
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: keys.session }),
    queryClient.invalidateQueries({ queryKey: keys.projects, exact: true }),
  ]);
  return project;
}
