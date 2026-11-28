import { lazy, Suspense } from 'react';

import { Skeleton } from '@/components/ui/Skeleton';

import { ChartTable } from './ChartTable';
import { resultRows, type Results } from './rows';

const ResultsBar = lazy(async () => ({ default: (await import('./ResultsBar')).ResultsBar }));

type Props = { counts: Results; caption: string; className?: string };

export function ResultsChart({ counts, caption, className }: Props) {
  const rows = resultRows(counts);

  return (
    <div className={className}>
      <ChartTable caption={caption} label="Result" value="Test cases" rows={rows} />
      <div aria-hidden="true" className="h-2">
        <Suspense fallback={<Skeleton />}>
          <ResultsBar rows={rows} />
        </Suspense>
      </div>
    </div>
  );
}
