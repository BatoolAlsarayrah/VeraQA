import { Link } from 'react-router';

import { IdTag, StatusBadge } from '@/components/domain';
import { itemPath } from '@/lib';
import type { SearchResult } from '@/types';

import { types } from '../filters';
import { Highlight } from './Highlight';

const priorities = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };

type Props = { projectId: string; result: SearchResult; match: string; showAssignee: boolean };

export function ResultRow({ projectId, result, match, showAssignee }: Props) {
  const { item, priority, assignee } = result;
  const about = [
    types.find((type) => type.value === item.type)?.label,
    showAssignee ? assignee?.name : undefined,
    priority ? priorities[priority] : undefined,
  ].filter(Boolean);

  return (
    <li className="border-t border-border first:border-t-0">
      <Link
        to={itemPath(projectId, item)}
        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 text-text no-underline transition-colors hover:bg-subtle tablet:grid-cols-[4.5rem_minmax(0,1fr)_auto] tablet:px-5"
      >
        <IdTag>{item.id}</IdTag>
        <span className="min-w-0 max-tablet:col-span-2 max-tablet:row-start-2">
          <span className="block font-medium">
            <Highlight text={item.title} match={match} />
          </span>
          <span className="block text-body-sm text-text-2">{about.join(', ')}</span>
        </span>
        <StatusBadge
          status={result.status}
          className="justify-self-end max-tablet:col-start-2 max-tablet:row-start-1"
        />
      </Link>
    </li>
  );
}
