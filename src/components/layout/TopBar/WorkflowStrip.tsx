import { Fragment } from 'react';
import { Link } from 'react-router';

import { cn, paths } from '@/lib';

export type Stage = 'srs' | 'requirements' | 'scenarios' | 'test-cases' | 'runs' | 'defects';

const stages: { id: Stage; label: string; to: (projectId: string) => string }[] = [
  { id: 'srs', label: 'SRS', to: paths.addRequirements },
  { id: 'requirements', label: 'Requirements', to: paths.requirements },
  { id: 'scenarios', label: 'Scenarios', to: paths.scenarios },
  { id: 'test-cases', label: 'Test cases', to: paths.testCases },
  { id: 'runs', label: 'Test runs', to: paths.runs },
  { id: 'defects', label: 'Defects', to: paths.defects },
];

type Props = {
  projectId: string;
  current: Stage;
  canUpload: boolean;
};

export function WorkflowStrip({ projectId, current, canUpload }: Props) {
  const at = stages.findIndex((stage) => stage.id === current);

  return (
    <nav aria-label="Workflow" className="flex min-w-0 items-center gap-1.5">
      {stages.map((stage, index) => {
        const done = index < at;
        const now = index === at;
        const content = (
          <>
            <span
              aria-hidden="true"
              className={cn(
                'shrink-0 rounded-full',
                now && 'size-3 border-3 border-primary bg-surface',
                done && 'size-2 bg-primary',
                !now && !done && 'size-2 border-[1.5px] border-border-2',
              )}
            />
            <span className={cn(!now && 'max-desktop:sr-only')}>{stage.label}</span>
          </>
        );
        const look = cn(
          'flex shrink-0 items-center gap-1.5 rounded-sm text-body-sm whitespace-nowrap',
          now && 'font-semibold text-text',
          done && 'text-text-2',
          !now && !done && 'text-text-3',
        );

        return (
          <Fragment key={stage.id}>
            {index > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  'h-0.5 w-4.5 shrink-0 rounded-[1px]',
                  index <= at ? 'bg-primary' : 'bg-border-2',
                )}
              />
            )}
            {stage.id === 'srs' && !canUpload ? (
              <span className={look}>{content}</span>
            ) : (
              <Link
                to={stage.to(projectId)}
                aria-current={now ? 'step' : undefined}
                className={cn(look, 'hover:text-text')}
              >
                {content}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
