import { Link } from 'react-router';

import { type Status, StatusBadge, TextWithIds } from '@/components/domain';
import { Panel } from '@/components/ui';
import { counted, paths } from '@/lib';
import type { Attention } from '@/types';

type Row = { status: Status; text: string; action: string; to: string };

function row(projectId: string, entry: Attention): Row {
  const count = entry.count ?? 0;
  const { item, defect, run } = entry;
  const runPath = run ? paths.run(projectId, String(run.number)) : paths.runs(projectId);
  switch (entry.kind) {
    case 'review-requirements':
      return {
        status: 'pending-review',
        text: `${counted(count, 'requirement')} ${count === 1 ? 'is' : 'are'} waiting for your decision`,
        action: 'Review',
        to: paths.requirements(projectId),
      };
    case 'approve-scenarios':
      return {
        status: 'pending-review',
        text: `${counted(count, 'AI-drafted scenario')} ${count === 1 ? 'needs' : 'need'} approval`,
        action: 'Review',
        to: paths.scenarios(projectId),
      };
    case 'approve-test-cases':
      return {
        status: 'pending-review',
        text: `${counted(count, 'AI-drafted test case')} ${count === 1 ? 'needs' : 'need'} approval`,
        action: 'Review',
        to: paths.testCases(projectId),
      };
    case 'run-tests':
      return {
        status: 'not-run',
        text: `${counted(count, 'test case')} assigned to you ${count === 1 ? 'hasn’t' : 'haven’t'} been run yet`,
        action: 'Run tests',
        to: paths.myWork(projectId),
      };
    case 'failed-test':
      return {
        status: 'failed',
        text: `${item?.id ?? ''} failed in Run ${String(run?.number ?? '')}: ${item?.title ?? ''}`,
        action: 'Open run',
        to: runPath,
      };
    case 'blocked-test':
      return {
        status: 'blocked',
        text:
          defect?.status === 'closed'
            ? `${item?.id ?? ''} can run again now that ${defect.id} is closed: ${item?.title ?? ''}`
            : `${item?.id ?? ''} is blocked by ${defect?.id ?? ''}: ${item?.title ?? ''}`,
        action: 'Open run',
        to: runPath,
      };
    case 'retest':
      return {
        status: 'retest',
        text: `${defect?.id ?? ''} is fixed and ready for retest: ${defect?.title ?? ''}`,
        action: 'Retest',
        to: paths.defect(projectId, defect?.id ?? ''),
      };
  }
}

type Props = { projectId: string; attention: Attention[] };

export function AttentionList({ projectId, attention }: Props) {
  return (
    <Panel title="Needs your attention" list>
      {attention.length === 0 ? (
        <p className="px-4 py-5 text-text-2 tablet:px-6">Nothing needs you right now.</p>
      ) : (
        <ul>
          {attention.map((entry, index) => {
            const { status, text, action, to } = row(projectId, entry);
            return (
              <li
                key={`${entry.kind}-${entry.item?.id ?? String(index)}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border px-4 py-3 first:border-t-0 tablet:flex-nowrap tablet:px-6"
              >
                <StatusBadge
                  status={status}
                  ai={status === 'pending-review'}
                  className="shrink-0 tablet:min-w-24 tablet:justify-center"
                />
                <p className="min-w-0 flex-1 basis-full text-body-sm text-text max-tablet:order-last tablet:basis-auto">
                  <TextWithIds>{text}</TextWithIds>
                </p>
                <Link
                  to={to}
                  className="shrink-0 text-label no-underline hover:underline max-tablet:ml-auto"
                >
                  {action}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
