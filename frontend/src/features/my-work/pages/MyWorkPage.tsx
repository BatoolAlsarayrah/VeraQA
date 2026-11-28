import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { PageHeader } from '@/components/layout';
import { Button, EmptyState, Panel, Skeleton } from '@/components/ui';
import { useCan, useProject } from '@/hooks';
import type { WorkGroup as Group } from '@/types';

import { myWorkQuery } from '../api';
import { AssignDialog } from '../components/AssignDialog';
import { WorkGroup } from '../components/WorkGroup';

const order: Group['kind'][] = [
  'ready-to-run-again',
  'requirements-to-review',
  'drafts-to-approve',
  'tests-to-run',
  'retests',
  'defects-to-fix',
];

function lede(groups: Group[] | undefined) {
  if (!groups) return undefined;
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  if (total === 0) return 'Nothing is assigned to you right now.';
  return `${String(total)} ${total === 1 ? 'item needs' : 'items need'} you, oldest due date first.`;
}

export function MyWorkPage() {
  const project = useProject();
  const projectId = project?.projectId ?? '';
  const work = useQuery({ ...myWorkQuery(projectId), enabled: Boolean(project) });
  const canAssign = useCan('manage');
  const [assigning, setAssigning] = useState(false);
  const groups = work.data?.groups
    .filter((group) => group.items.length > 0)
    .toSorted((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));

  return (
    <>
      <PageHeader
        title="My work"
        lede={lede(groups)}
        actions={
          canAssign && (
            <Button variant="primary" onClick={() => setAssigning(true)}>
              Assign work
            </Button>
          )
        }
      />
      {canAssign && (
        <AssignDialog projectId={projectId} open={assigning} onClose={() => setAssigning(false)} />
      )}
      {work.isPending && (
        <Panel aria-busy="true">
          <Skeleton lines={5} />
        </Panel>
      )}
      {work.isError && (
        <Panel>
          <p className="text-text-2">
            Your work couldn’t load. Check your connection, then try again.
          </p>
          <Button className="self-start" onClick={() => void work.refetch()}>
            Try again
          </Button>
        </Panel>
      )}
      {groups?.length === 0 && (
        <Panel>
          <EmptyState title="You’re all caught up">
            New work shows up here when someone assigns it to you.
          </EmptyState>
        </Panel>
      )}
      {groups?.map((group) => (
        <WorkGroup key={group.kind} projectId={projectId} group={group} now={work.dataUpdatedAt} />
      ))}
    </>
  );
}
