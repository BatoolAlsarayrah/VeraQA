import { useQuery } from '@tanstack/react-query';

import { PageHeader } from '@/components/layout';
import { Button, EmptyState, Panel, Skeleton } from '@/components/ui';

import { invitationsQuery, projectsQuery } from '../api';
import { InvitationCard } from '../components/InvitationCard';
import { ProjectList } from '../components/ProjectList';

function Projects() {
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
        <EmptyState title="No projects yet">
          Create a project to start testing, or ask a project manager to invite you to theirs.
        </EmptyState>
      </Panel>
    );
  }
  return <ProjectList projects={projects.data} />;
}

export function ProjectsPage() {
  const invitations = useQuery(invitationsQuery);

  return (
    <>
      <PageHeader
        title="Your projects"
        lede="Only projects you’re a member of. Your role can differ in each one."
      />
      {invitations.data?.map((invitation) => (
        <InvitationCard key={invitation.id} invitation={invitation} />
      ))}
      <Projects />
    </>
  );
}
