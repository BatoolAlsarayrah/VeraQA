import { type KeyboardEvent, useRef } from 'react';

import { cn } from '@/lib';

import { segmentOn, segmentOption, segmentTrack } from '../Segmented';
import { panelId, tabId } from './ids';

type Tab<T extends string> = {
  id: T;
  label: string;
  count?: number;
};

type Props<T extends string> = {
  name: string;
  label: string;
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function Tabs<T extends string>({
  name,
  label,
  tabs,
  value,
  onChange,
  className,
}: Props<T>) {
  const list = useRef<HTMLDivElement>(null);

  function select(index: number) {
    const tab = tabs[(index + tabs.length) % tabs.length];
    if (!tab) return;
    onChange(tab.id);
    list.current?.querySelector<HTMLButtonElement>(`#${CSS.escape(tabId(name, tab.id))}`)?.focus();
  }

  function handleKey(event: KeyboardEvent<HTMLButtonElement>) {
    const current = tabs.findIndex((tab) => tab.id === value);
    const moves: Record<string, number> = {
      ArrowRight: current + 1,
      ArrowLeft: current - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
  }

  return (
    <div ref={list} role="tablist" aria-label={label} className={cn(segmentTrack, className)}>
      {tabs.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            id={tabId(name, tab.id)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId(name, tab.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={handleKey}
            className={cn(segmentOption, 'cursor-pointer', selected && segmentOn)}
          >
            {tab.count === undefined ? tab.label : `${tab.label} `}
            {tab.count !== undefined && <span>{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
