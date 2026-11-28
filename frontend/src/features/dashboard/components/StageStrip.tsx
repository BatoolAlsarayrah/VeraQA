import { Link } from 'react-router';

import { useCan } from '@/hooks';
import { cn, counted, paths } from '@/lib';
import type { Dashboard } from '@/types';

type State = 'done' | 'empty' | 'bad';
type Stop = { label: string; value: string; caption: string; to: string; state: State };

const reviewed = (review: { total: number; approved: number; pending: number }) =>
  review.total
    ? `${String(review.approved)} approved, ${String(review.pending)} pending review`
    : 'None yet';

function stops(projectId: string, stages: Dashboard['stages'], srs: boolean): Stop[] {
  const { run, defects } = stages;
  const list: Stop[] = [
    {
      label: 'Requirements',
      value: String(stages.requirements.total),
      caption: reviewed(stages.requirements),
      to: paths.requirements(projectId),
      state: stages.requirements.total ? 'done' : 'empty',
    },
    {
      label: 'Test scenarios',
      value: String(stages.scenarios.total),
      caption: reviewed(stages.scenarios),
      to: paths.scenarios(projectId),
      state: stages.scenarios.total ? 'done' : 'empty',
    },
    {
      label: 'Test cases',
      value: String(stages.testCases.total),
      caption: reviewed(stages.testCases),
      to: paths.testCases(projectId),
      state: stages.testCases.total ? 'done' : 'empty',
    },
    {
      label: 'Test runs',
      value: run ? `${String(run.ran)}/${String(run.total)}` : '0',
      caption: run ? `test cases run in Run ${String(run.number)}` : 'No active run',
      to: paths.runs(projectId),
      state: run ? 'done' : 'empty',
    },
    {
      label: 'Defects',
      value: String(defects.open),
      caption: defects.critical ? `open, ${String(defects.critical)} critical` : 'open',
      to: paths.defects(projectId),
      state: defects.open ? 'bad' : 'empty',
    },
  ];
  if (!srs) return list;
  return [
    {
      label: 'SRS',
      value: String(stages.srs.files),
      caption: stages.srs.files ? `${counted(stages.srs.files, 'file')} analyzed` : 'No SRS yet',
      to: paths.addRequirements(projectId),
      state: stages.srs.files ? 'done' : 'empty',
    },
    ...list,
  ];
}

const node: Record<State, string> = {
  done: 'bg-primary',
  bad: 'bg-bad-fill',
  empty: 'border-2 border-border-2 bg-surface',
};

type Props = { projectId: string; stages: Dashboard['stages'] };

export function StageStrip({ projectId, stages }: Props) {
  const list = stops(projectId, stages, useCan('upload'));

  return (
    <ol
      aria-label="Stages"
      className={cn(
        'grid grid-cols-2 gap-y-5 rounded-panel border border-border bg-surface p-4 transition-theme tablet:gap-y-0 tablet:px-6 tablet:py-5',
        list.length === 6 ? 'tablet:grid-cols-6' : 'tablet:grid-cols-5',
      )}
    >
      {list.map((stop, index) => {
        const next = list[index + 1];
        return (
          <li key={stop.label} className="flex min-w-0 flex-col">
            <span aria-hidden="true" className="flex items-center">
              <span className={cn('size-3.5 shrink-0 rounded-full', node[stop.state])} />
              {next && (
                <span
                  className={cn(
                    'h-0.75 flex-1 max-tablet:hidden',
                    next.state === 'empty' ? 'bg-border-2' : 'bg-primary',
                  )}
                />
              )}
            </span>
            <Link to={stop.to} className="mt-3 flex flex-col pr-3 text-text no-underline">
              <span className="text-label">{stop.label}</span>
              <span className="text-metric tabular-nums">{stop.value}</span>
              <span className="text-caption text-text-2">{stop.caption}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
