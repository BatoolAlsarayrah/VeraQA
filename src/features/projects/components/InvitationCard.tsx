import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { Button, useToast } from '@/components/ui';
import { homePath, HttpError, NetworkError, queryClient, roleLabels, sessionQuery } from '@/lib';
import type { Invitation } from '@/types';

import { acceptInvitation, declineInvitation } from '../api';

function joinAs(invitation: Invitation) {
  const label = roleLabels[invitation.role];
  const role = label.startsWith('QA') ? label : label.toLowerCase();
  const about = invitation.project.description.trim().replace(/\.$/, '');
  return `${about ? `${about}. ` : ''}You’d join as a ${role}.`;
}

function problem(error: unknown) {
  if (error instanceof HttpError || error instanceof NetworkError) return error.message;
  return 'That didn’t go through. Try again.';
}

export function InvitationCard({ invitation }: { invitation: Invitation }) {
  const navigate = useNavigate();
  const toast = useToast();
  const accept = useMutation({
    mutationFn: () => acceptInvitation(invitation.id),
    onSuccess: async (project) => {
      const session = await queryClient.fetchQuery(sessionQuery);
      const membership = session.memberships.find((entry) => entry.projectId === project.id);
      await navigate(homePath(project.id, membership?.capabilities ?? []));
    },
    onError: (error) => toast(problem(error)),
  });
  const decline = useMutation({
    mutationFn: () => declineInvitation(invitation.id),
    onSuccess: () => toast('Invitation declined'),
    onError: (error) => toast(problem(error)),
  });
  const busy = accept.isPending || decline.isPending;

  return (
    <section
      aria-label={`Invitation to ${invitation.project.name}`}
      className="flex flex-wrap items-center gap-x-3.5 gap-y-3 rounded-panel bg-sel px-4 py-3.5 transition-theme tablet:px-6"
    >
      <div className="min-w-0 flex-1 basis-56">
        <p className="text-body-strong text-text">
          {invitation.invitedBy.name} invited you to {invitation.project.name}
        </p>
        <p className="text-body-sm text-text-2">{joinAs(invitation)}</p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          loading={decline.isPending}
          disabled={busy}
          onClick={() => decline.mutate()}
        >
          Decline
        </Button>
        <Button
          size="sm"
          variant="primary"
          loading={accept.isPending}
          disabled={busy}
          onClick={() => accept.mutate()}
        >
          Accept
        </Button>
      </div>
    </section>
  );
}
