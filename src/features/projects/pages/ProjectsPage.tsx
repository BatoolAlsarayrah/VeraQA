import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { PageHeader } from '@/components/layout';
import { Button, EmptyState, Panel, Skeleton, useToast } from '@/components/ui';
import { InviteDialog } from '@/features/members';
import { paths } from '@/lib';
import type { Project } from '@/types';

import { invitationsQuery, projectsQuery } from '../api';
import { CreateProjectDialog } from '../components/CreateProjectDialog';
import { InvitationCard } from '../components/InvitationCard';
import { ProjectList } from '../components/ProjectList';

function Projects({ onCreate }: { onCreate: () => void }) {
  const projects = useQuery(projectsQuery);

  if (projects.isPending) {
    return (
      <Panel>
        <Skeleton lines={4} />
      </Panel>
    );
  }
  if (projects.isError) {
    return (
      <Panel>
        <p className="text-text-2">
          Your projects couldn’t load. Check your connection, then try again.
        </p>
        <Button className="self-start" onClick={() => void projects.refetch()}>
          Try again
        </Button>
      </Panel>
    );
  }
  if (projects.data.length === 0) {
    return (
      <Panel>
        <EmptyState
          title="No projects yet"
          action={
            <Button variant="primary" onClick={onCreate}>
              Create project
            </Button>
          }
        >
          Create a project to start testing, or ask a project manager to invite you to theirs.
        </EmptyState>
      </Panel>
    );
  }
  return <ProjectList projects={projects.data} />;
}

function sentTo(emails: string[]) {
  return emails.length === 1
    ? `Invite sent to ${emails[0] ?? ''}`
    : `Invites sent to ${emails.length} people`;
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const invitations = useQuery(invitationsQuery);
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState<Project | null>(null);

  const open = (project: Project) => void navigate(paths.dashboard(project.id));

  return (
    <>
      <PageHeader
        title="Your projects"
        lede="Only projects you’re a member of. Your role can differ in each one."
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            Create project
          </Button>
        }
      />
      {invitations.data?.map((invitation) => (
        <InvitationCard key={invitation.id} invitation={invitation} />
      ))}
      <Projects onCreate={() => setCreating(true)} />
      <CreateProjectDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(project, team) => {
          setCreating(false);
          if (team) setInviting(project);
          else open(project);
        }}
      />
      {inviting && (
        <InviteDialog
          projectId={inviting.id}
          open
          cancelLabel="Skip for now"
          onClose={() => open(inviting)}
          onSent={(emails) => {
            toast(sentTo(emails));
            open(inviting);
          }}
        />
      )}
    </>
  );
}
