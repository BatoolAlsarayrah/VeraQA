import type { WorkGroup as Group } from '@/types';

import { WorkRow } from './WorkRow';

const groupTitles: Record<Group['kind'], string> = {
  'ready-to-run-again': 'Ready to run again',
  'requirements-to-review': 'Requirements pending review',
  'drafts-to-approve': 'AI drafts to approve',
  'tests-to-run': 'Tests to run',
  retests: 'Retests',
  'defects-to-fix': 'Defects to fix',
};

type Props = { projectId: string; group: Group; now: number };

export function WorkGroup({ projectId, group, now }: Props) {
  const title = groupTitles[group.kind];
  const items = group.items.toSorted((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999'));

  return (
    <section
      aria-label={title}
      className="overflow-hidden rounded-panel border border-border bg-surface transition-theme"
    >
      <h2 className="flex items-baseline gap-2 px-4 pt-4 pb-2.5 text-title text-text tablet:px-6">
        {title} <span className="font-medium text-text-2 tabular-nums">{items.length}</span>
      </h2>
      <ul className="border-t border-border">
        {items.map((work) => (
          <WorkRow
            key={work.item.id}
            projectId={projectId}
            kind={group.kind}
            work={work}
            now={now}
          />
        ))}
      </ul>
    </section>
  );
}
