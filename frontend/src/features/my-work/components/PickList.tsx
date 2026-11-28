import { useQuery } from '@tanstack/react-query';

import { IdTag, PriorityBadge } from '@/components/domain';
import { Skeleton } from '@/components/ui';

import { type Pickable, pickableQuery } from '../api';

type Props = {
  projectId: string;
  type: Pickable['type'];
  picked: Map<string, Pickable>;
  onToggle: (item: Pickable) => void;
};

const nothing: Record<Pickable['type'], string> = {
  requirement: 'No requirements are waiting for review.',
  scenario: 'No scenarios are waiting for review.',
  'test-case': 'No test cases to assign.',
  defect: 'No open defects to assign.',
};

export function PickList({ projectId, type, picked, onToggle }: Props) {
  const items = useQuery(pickableQuery(projectId, type));

  if (items.isPending) return <Skeleton lines={4} />;
  if (items.isError) return <p className="text-text-2">This list couldn’t load. Try again.</p>;
  if (items.data.length === 0) return <p className="py-4 text-text-2">{nothing[type]}</p>;

  return (
    <ul className="max-h-72 overflow-y-auto rounded-sm border border-border">
      {items.data.map((item) => (
        <li key={item.id} className="border-t border-border first:border-t-0">
          <label className="grid cursor-pointer grid-cols-[auto_4rem_minmax(0,1fr)_auto] items-center gap-2.5 px-3 py-2.5 hover:bg-subtle">
            <input
              type="checkbox"
              checked={picked.has(`${type}:${item.id}`)}
              onChange={() => onToggle(item)}
              className="size-4 accent-primary-fill"
            />
            <IdTag>{item.id}</IdTag>
            <span className="min-w-0 text-body-sm text-text">{item.title}</span>
            {item.priority ? <PriorityBadge level={item.priority} /> : <span />}
          </label>
        </li>
      ))}
    </ul>
  );
}
