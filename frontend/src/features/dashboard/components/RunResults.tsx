import { Link } from 'react-router';

import { ResultsChart } from '@/components/domain';
import { Panel } from '@/components/ui';
import { paths } from '@/lib';
import type { Dashboard } from '@/types';

type Props = { projectId: string; run: Dashboard['run'] };

export function RunResults({ projectId, run }: Props) {
  if (!run) {
    return (
      <Panel title="Test results">
        <p className="text-text-2">No test run is active yet.</p>
      </Panel>
    );
  }

  const name = `Run ${String(run.number)} · ${run.name}`;
  const { passed, failed, blocked, notRun } = run.counts;
  const columns = [
    ['Passed', passed],
    ['Failed', failed],
    ['Blocked', blocked],
    ['Not run', notRun],
  ] as const;

  return (
    <Panel
      title={`Test results in ${name}`}
      actions={
        <Link
          to={paths.run(projectId, String(run.number))}
          className="text-label no-underline hover:underline"
        >
          Open test run
        </Link>
      }
    >
      <ResultsChart caption={`Test results in ${name}`} counts={run.counts} />
      <dl aria-hidden="true" className="grid grid-cols-4 gap-3">
        {columns.map(([label, value]) => (
          <div key={label} className="flex flex-col-reverse">
            <dt className="text-caption text-text-2">{label}</dt>
            <dd className="text-title text-text tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
