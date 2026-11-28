import { lazy, Suspense } from 'react';

import { Skeleton } from '@/components/ui/Skeleton';
import type { BySeverity } from '@/types';

import { ChartTable } from './ChartTable';
import { severityRows } from './rows';

const SeverityBars = lazy(async () => ({ default: (await import('./SeverityBars')).SeverityBars }));

type Props = { counts: BySeverity; caption: string; className?: string };

export function SeverityChart({ counts, caption, className }: Props) {
  const rows = severityRows(counts);

  return (
    <div className={className}>
      <ChartTable caption={caption} label="Severity" value="Open defects" rows={rows} />
      <div aria-hidden="true" className="h-32">
        <Suspense fallback={<Skeleton lines={4} />}>
          <SeverityBars rows={rows} />
        </Suspense>
      </div>
    </div>
  );
}
