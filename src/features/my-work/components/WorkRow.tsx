import { IdTag, TextWithIds } from '@/components/domain';
import { LinkButton } from '@/components/ui';
import { cn, counted, dueLabel, paths } from '@/lib';
import type { WorkGroup, WorkItem } from '@/types';

type Kind = WorkGroup['kind'];

function itemPath(projectId: string, { type, id }: WorkItem['item']) {
  if (type === 'requirement') return paths.requirement(projectId, id);
  if (type === 'scenario') return paths.scenario(projectId, id);
  if (type === 'test-case') return paths.testCase(projectId, id);
  return paths.defect(projectId, id);
}

function details(projectId: string, kind: Kind, work: WorkItem) {
  const { item, run } = work;
  const runTest = run && paths.runTest(projectId, String(run.number), item.id);
  switch (kind) {
    case 'requirements-to-review':
      return {
        note: work.openFindings
          ? `AI flagged ${counted(work.openFindings, 'issue')}`
          : 'No issues flagged',
        action: 'Review',
        to: itemPath(projectId, item),
      };
    case 'drafts-to-approve':
      return {
        note: `AI drafted this ${item.type === 'scenario' ? 'scenario' : 'test case'} for ${work.draftedFor?.id ?? ''}`,
        action: 'Approve',
        to: itemPath(projectId, item),
      };
    case 'tests-to-run':
      return {
        note: `Run ${String(run?.number ?? '')} · ${run?.name ?? ''}${work.assignedBy ? `, assigned by ${work.assignedBy.name}` : ''}`,
        action: 'Run test',
        to: runTest ?? itemPath(projectId, item),
      };
    case 'ready-to-run-again':
      return {
        note: `${work.blockedBy?.id ?? ''} is closed, so ${work.blockedStep ? `step ${String(work.blockedStep)}` : 'this test'} isn’t blocked any more.`,
        action: 'Run test',
        to: runTest ?? itemPath(projectId, item),
      };
    case 'retests':
      return {
        note: `${work.fixedBy?.name ?? 'The developer'} fixed it. Run ${work.retest?.id ?? 'its test'} again.`,
        action: 'Retest',
        to: itemPath(projectId, item),
      };
    case 'defects-to-fix':
      return { note: 'Assigned to you to fix.', action: 'Open', to: itemPath(projectId, item) };
  }
}

type Props = { projectId: string; kind: Kind; work: WorkItem; now: number };

export function WorkRow({ projectId, kind, work, now }: Props) {
  const { note, action, to } = details(projectId, kind, work);
  const due = work.due ? dueLabel(work.due, now) : null;

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-t border-border px-4 py-3 first:border-t-0 tablet:grid-cols-[4.5rem_minmax(0,1fr)_auto_auto] tablet:px-6">
      <IdTag className="max-tablet:col-start-1 max-tablet:row-start-1">{work.item.id}</IdTag>
      <div className="min-w-0 max-tablet:col-span-2">
        <p className="font-medium text-text">{work.item.title}</p>
        <p className="text-body-sm text-text-2">
          <TextWithIds>{note}</TextWithIds>
        </p>
      </div>
      {due ? (
        <span
          className={cn(
            'text-body-sm max-tablet:col-span-2',
            due.urgent ? 'font-semibold' : 'text-text-2',
            due.text === 'Overdue' ? 'text-bad' : due.urgent && 'text-text',
          )}
        >
          {due.text}
        </span>
      ) : (
        <span className="max-tablet:hidden" />
      )}
      <LinkButton
        to={to}
        size="sm"
        className="max-tablet:col-start-2 max-tablet:row-start-1"
        aria-label={`${action} ${work.item.id}`}
      >
        {action}
      </LinkButton>
    </li>
  );
}
