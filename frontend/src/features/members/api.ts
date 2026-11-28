import { queryOptions } from '@tanstack/react-query';

import { keys, none, queryClient, request } from '@/lib';
import { type InviteInput, list, Member } from '@/types';

export const membersQuery = (projectId: string) =>
  queryOptions({
    queryKey: [...keys.project(projectId), 'members'],
    queryFn: async () =>
      (await request(`/projects/${encodeURIComponent(projectId)}/members`, list(Member))).items,
  });

export async function invite(projectId: string, input: InviteInput) {
  await request(`/projects/${encodeURIComponent(projectId)}/invitations`, none, {
    method: 'POST',
    body: input,
  });
  await queryClient.invalidateQueries({ queryKey: keys.project(projectId) });
}
