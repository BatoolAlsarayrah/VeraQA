import { Link } from 'react-router';

import { Avatar } from '@/components/domain/Avatar';
import { Icon } from '@/components/domain/Icon';
import { Sheet } from '@/components/ui/Sheet';
import { useCan, useProject, useSession } from '@/hooks';
import { demoCounts, paths, roleLabels } from '@/lib';

import { ThemeButton } from '../TopBar';
import { MoreLink } from './MoreLink';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MoreSheet({ open, onClose }: Props) {
  const { user } = useSession();
  const project = useProject();
  const approve = useCan('approve');
  const trace = useCan('trace');
  const manage = useCan('manage');

  if (!project) return null;
  const id = project.projectId;
  const counts = demoCounts(id);

  return (
    <Sheet open={open} onClose={onClose} title="More" titleHidden>
      <div className="flex items-center gap-1 pb-1.5">
        <Link
          to={paths.account}
          className="flex min-h-14 min-w-0 flex-1 items-center gap-3 text-text no-underline"
        >
          <Avatar name={user.name} size={40} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-title font-semibold">{user.name}</span>{' '}
            <span className="text-body-sm text-text-2">
              {roleLabels[project.role]} in {project.projectName}
            </span>
          </span>
        </Link>
        <ThemeButton className="size-11 rounded-panel" />
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-panel text-text-2 active:bg-subtle"
        >
          <Icon name="x" size={24} />
        </button>
      </div>
      <nav aria-label="Project" className="flex flex-col">
        <div className="border-t border-border py-1.5">
          <h3 className="px-2 pt-2 pb-1 text-caption font-semibold text-text-3">Testing stages</h3>
          <MoreLink
            to={paths.requirements(id)}
            icon="file-text"
            label="Requirements"
            count={approve ? counts.pendingReview : undefined}
            line
          />
          <MoreLink to={paths.scenarios(id)} icon="flow-arrow" label="Test scenarios" line />
          <MoreLink to={paths.testCases(id)} icon="check-square" label="Test cases" line />
          <MoreLink to={paths.runs(id)} icon="play-circle" label="Test runs" line />
          <MoreLink
            to={paths.defects(id)}
            icon="bug"
            label="Defects"
            count={counts.openDefects}
            alert
          />
        </div>
        {(trace || manage) && (
          <div className="border-t border-border py-1.5">
            {trace && (
              <MoreLink to={paths.traceability(id)} icon="tree-structure" label="Traceability" />
            )}
            {manage && (
              <>
                <MoreLink to={paths.reports(id)} icon="chart-bar" label="Reports" />
                <MoreLink to={paths.members(id)} icon="users" label="Members" />
                <MoreLink
                  to={paths.activity(id)}
                  icon="clock-counter-clockwise"
                  label="Activity log"
                />
                <MoreLink to={paths.settings(id)} icon="gear-six" label="Project settings" />
              </>
            )}
          </div>
        )}
        <div className="border-t border-border pt-1.5">
          <MoreLink to={paths.projects} icon="caret-up-down" label="Switch project" end />
          <MoreLink to={paths.account} icon="user" label="Account settings" />
        </div>
      </nav>
    </Sheet>
  );
}
