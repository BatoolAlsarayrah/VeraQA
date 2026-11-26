import { keys, none, queryClient, request } from '@/lib';
import type { InviteInput } from '@/types';

export async function invite(projectId: string, input: InviteInput) {
  await request(`/projects/${encodeURIComponent(projectId)}/invitations`, none, {
    method: 'POST',
    body: input,
  });
  await queryClient.invalidateQueries({ queryKey: keys.project(projectId) });
}
