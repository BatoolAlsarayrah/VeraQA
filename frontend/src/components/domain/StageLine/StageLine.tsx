import { Fragment } from 'react';

import { cn } from '@/lib';
import type { Stage } from '@/types';

import { stop } from './stages';

const stops = [1, 2, 3, 4, 5, 6];

export function StageLine({ stage, className }: { stage: Stage; className?: string }) {
  const now = stop[stage];

  return (
    <span aria-hidden="true" className={cn('flex items-center', className)}>
      {stops.map((at) => (
        <Fragment key={at}>
          {at > 1 && (
            <span className={cn('h-0.75 min-w-2 flex-1', at <= now ? 'bg-primary' : 'bg-border')} />
          )}
          <span
            className={cn(
              'shrink-0 rounded-full',
              at < now && 'size-3 bg-primary',
              at === now && 'size-4 border-4 border-primary bg-surface',
              at > now && 'size-3 border-3 border-border-2 bg-surface',
            )}
          />
        </Fragment>
      ))}
    </span>
  );
}
