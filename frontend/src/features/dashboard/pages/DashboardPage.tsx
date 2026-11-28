import { useQuery } from '@tanstack/react-query';

import { PageHeader } from '@/components/layout';
import { Button, EmptyState, LinkButton, Panel, Skeleton } from '@/components/ui';
import { useCan, useProject } from '@/hooks';
import { counted, dayLabel, paths } from '@/lib';
import type { Dashboard, Membership } from '@/types';

import { dashboardQuery } from '../api';
import { AttentionList } from '../components/AttentionList';
import { RecentActivity } from '../components/RecentActivity';
import { RunResults } from '../components/RunResults';
import { SeverityPanel } from '../components/SeverityPanel';
import { StageStrip } from '../components/StageStrip';

function intro(membership: Membership, targetDate: string | null | undefined) {
  const role =
    membership.role === 'project-manager'
      ? 'You’re the project manager of this project.'
      : `You’re a ${membership.role === 'qa-lead' ? 'QA lead' : 'QA engineer'} on this project.`;
  return targetDate ? `${role} Target date ${dayLabel(targetDate)}.` : role;
}

function mainAction(projectId: string, dashboard: Dashboard | undefined) {
  const review = dashboard?.attention.find((entry) => entry.kind === 'review-requirements');
  if (review?.count) {
    return {
      label: `Review ${counted(review.count, 'requirement')}`,
      to: paths.requirements(projectId),
    };
  }
  const run = dashboard?.attention.find((entry) => entry.kind === 'run-tests');
  if (run?.count) {
    return { label: `Run ${counted(run.count, 'test case')}`, to: paths.myWork(projectId) };
  }
  return null;
}

function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading the dashboard"
      className="flex flex-col gap-section-gap"
    >
      <Panel>
        <Skeleton lines={3} />
      </Panel>
      <div className="grid gap-section-gap desktop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <Skeleton lines={5} />
        </Panel>
        <Panel>
          <Skeleton lines={4} />
        </Panel>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const project = useProject();
  const canUpload = useCan('upload');
  const projectId = project?.projectId ?? '';
  const dashboard = useQuery({ ...dashboardQuery(projectId), enabled: Boolean(project) });

  if (!project) return null;

  const data = dashboard.data;
  const action = mainAction(projectId, data);
  const empty = data && data.stages.requirements.total === 0 && data.stages.srs.files === 0;

  return (
    <>
      <PageHeader
        title={project.projectName}
        lede={intro(project, data?.targetDate)}
        actions={
          action && (
            <LinkButton to={action.to} variant="primary">
              {action.label}
            </LinkButton>
          )
        }
      />
      {dashboard.isError && (
        <Panel>
          <p className="text-text-2">
            The dashboard couldn’t load. Check your connection, then try again.
          </p>
          <Button className="self-start" onClick={() => void dashboard.refetch()}>
            Try again
          </Button>
        </Panel>
      )}
      {dashboard.isPending && <Loading />}
      {empty && (
        <Panel>
          <EmptyState
            title="Nothing to show yet"
            action={
              canUpload && (
                <LinkButton to={paths.addRequirements(projectId)} variant="primary">
                  Add requirements
                </LinkButton>
              )
            }
          >
            Add requirements to start the line.
          </EmptyState>
        </Panel>
      )}
      {data && !empty && (
        <>
          <StageStrip projectId={projectId} stages={data.stages} />
          <div className="grid items-start gap-section-gap desktop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col gap-section-gap">
              <AttentionList projectId={projectId} attention={data.attention} />
              <RunResults projectId={projectId} run={data.run} />
            </div>
            <div className="flex min-w-0 flex-col gap-section-gap">
              <SeverityPanel projectId={projectId} defects={data.defects} />
              <RecentActivity activity={data.activity} now={dashboard.dataUpdatedAt} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
