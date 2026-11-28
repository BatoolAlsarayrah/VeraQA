import { useQuery } from '@tanstack/react-query';
import { type ReactNode, useId } from 'react';

import { statuses } from '@/components/domain';
import { Select } from '@/components/ui';
import { membersQuery } from '@/features/members';

import type { Filters } from '../api';
import { statusesFor, types } from '../filters';

type Props = {
  projectId: string;
  filters: Filters;
  onChange: (next: Partial<Filters>) => void;
};

function Pick({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <div className="contents tablet:flex tablet:items-center tablet:gap-2">
      <label htmlFor={id} className="text-label text-text-2">
        {label}
      </label>
      {children}
    </div>
  );
}

export function SearchFilters({ projectId, filters, onChange }: Props) {
  const members = useQuery(membersQuery(projectId));
  const options = statusesFor(filters.type);
  const id = useId();

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 tablet:flex tablet:flex-wrap tablet:gap-x-4 tablet:gap-y-3">
      <Pick label="Type" id={`${id}-type`}>
        <Select
          id={`${id}-type`}
          value={filters.type}
          onChange={(event) => {
            const type = event.target.value;
            const keep = statusesFor(type).some((status) => status === filters.status);
            onChange({ type, status: keep ? filters.status : '' });
          }}
        >
          <option value="">Everything</option>
          {types.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
      </Pick>
      <Pick label="Priority" id={`${id}-priority`}>
        <Select
          id={`${id}-priority`}
          value={filters.priority}
          onChange={(event) => onChange({ priority: event.target.value })}
        >
          <option value="">Any</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
      </Pick>
      <Pick label="Assignee" id={`${id}-assignee`}>
        <Select
          id={`${id}-assignee`}
          value={filters.assignee}
          onChange={(event) => onChange({ assignee: event.target.value })}
        >
          <option value="">Anyone</option>
          {(members.data ?? [])
            .filter((member) => member.status !== 'invited')
            .map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
        </Select>
      </Pick>
      <Pick label="Status" id={`${id}-status`}>
        <Select
          id={`${id}-status`}
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value })}
        >
          <option value="">Any</option>
          {options.map((status) => (
            <option key={status} value={status}>
              {statuses[status].label}
            </option>
          ))}
        </Select>
      </Pick>
    </div>
  );
}
