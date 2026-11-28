import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import { PageHeader } from '@/components/layout';
import { EmptyState, Field, Input, Panel, Skeleton } from '@/components/ui';
import { useCan, useProject } from '@/hooks';

import { type Filters, searchQuery } from '../api';
import { ResultRow } from '../components/ResultRow';
import { SearchFilters } from '../components/SearchFilters';

const keys = ['q', 'type', 'status', 'priority', 'assignee'] as const;

export function SearchPage() {
  const project = useProject();
  const projectId = project?.projectId ?? '';
  const everything = useCan('workspace');
  const [params, setParams] = useSearchParams();
  const filters = Object.fromEntries(keys.map((key) => [key, params.get(key) ?? ''])) as Filters;
  const [text, setText] = useState(filters.q);
  const [seen, setSeen] = useState(filters.q);
  const results = useQuery({ ...searchQuery(projectId, filters), enabled: Boolean(project) });

  // A new ?q from the top bar replaces what's in the field, without fighting the person's typing.
  if (filters.q !== seen) {
    setSeen(filters.q);
    setText(filters.q);
  }

  function update(next: Partial<Filters>) {
    setParams(
      (current) => {
        for (const [key, value] of Object.entries(next)) {
          if (value) current.set(key, value);
          else current.delete(key);
        }
        return current;
      },
      { replace: true },
    );
  }

  const typed = text.trim();
  useEffect(() => {
    if (typed === filters.q) return;
    const timer = setTimeout(() => {
      setSeen(typed);
      setParams(
        (current) => {
          if (typed) current.set('q', typed);
          else current.delete('q');
          return current;
        },
        { replace: true },
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [typed, filters.q, setParams]);

  const items = results.data ?? [];
  const query = filters.q;
  const count = `${String(items.length)} ${items.length === 1 ? 'result' : 'results'}${query ? ` for “${query}”` : ''}`;

  return (
    <>
      <PageHeader title="Search" />
      <Panel>
        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="flex flex-col gap-3"
        >
          <Field label={everything ? 'Search for' : 'Search your defects'}>
            <Input
              type="search"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={everything ? 'IDs, titles or requirement text' : 'IDs or titles'}
            />
          </Field>
          {everything && (
            <SearchFilters projectId={projectId} filters={filters} onChange={update} />
          )}
        </form>
      </Panel>
      <p role="status" className="text-body-sm text-text-2">
        {results.isSuccess ? count : ''}
      </p>
      {results.isPending && (
        <Panel>
          <Skeleton lines={4} />
        </Panel>
      )}
      {results.isError && (
        <Panel>
          <p className="text-text-2">
            Search couldn’t load. Check your connection, then try again.
          </p>
        </Panel>
      )}
      {results.isSuccess && items.length === 0 && (
        <Panel>
          <EmptyState title={query ? `No results for “${query}”` : 'No results'}>
            Check the spelling, or try an ID such as TC-031.
          </EmptyState>
        </Panel>
      )}
      {items.length > 0 && (
        <ul
          aria-label="Results"
          className="overflow-hidden rounded-panel border border-border bg-surface transition-theme"
        >
          {items.map((result) => (
            <ResultRow
              key={`${result.item.type}-${result.item.id}`}
              projectId={projectId}
              result={result}
              match={query}
              showAssignee={everything}
            />
          ))}
        </ul>
      )}
    </>
  );
}
