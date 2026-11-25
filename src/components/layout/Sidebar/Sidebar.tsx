import { Link } from 'react-router';

import { Logo } from '@/components/domain/Logo';
import { useCan, useMediaQuery, useProject, useSession } from '@/hooks';
import { cn, demoCounts, paths, roleLabels } from '@/lib';

import { ProjectSwitcher } from './ProjectSwitcher';
import { SidebarFooter } from './SidebarFooter';
import { SidebarLink } from './SidebarLink';

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

function Divider({ compact }: { compact: boolean }) {
  return (
    <div className="py-2">
      <div className={cn('h-px bg-rail-3', compact ? 'w-8' : 'w-full')} />
    </div>
  );
}

export function Sidebar({ collapsed, onToggle }: Props) {
  const { user } = useSession();
  const project = useProject();
  const desktop = useMediaQuery('(min-width: 68.8125rem)');
  const workspace = useCan('workspace');
  const approve = useCan('approve');
  const trace = useCan('trace');
  const manage = useCan('manage');
  const compact = !desktop || collapsed;

  if (!project) return null;
  const id = project.projectId;
  const counts = demoCounts(id);
  const link = { compact };

  return (
    <div
      id="sidebar"
      className={cn(
        'sticky top-0 flex h-dvh shrink-0 flex-col overflow-y-auto bg-rail text-on-rail focus-on-rail transition-theme max-tablet:hidden',
        compact ? 'w-16 items-center' : 'w-60',
      )}
    >
      <div className={cn('flex flex-col gap-4 pt-4 pb-3', compact ? 'items-center' : 'px-3')}>
        <Link
          to={paths.projects}
          aria-label="VeraQA, your projects"
          className={cn('flex rounded-control text-on-rail', !compact && 'px-1')}
        >
          {compact ? <Logo size={32} /> : <Logo size={40} withName />}
        </Link>
        {!compact && <ProjectSwitcher name={project.projectName} />}
      </div>
      <nav
        aria-label="Main"
        className={cn('flex flex-1 flex-col gap-0.5 py-1', compact ? 'items-center' : 'px-3')}
      >
        {workspace ? (
          <>
            <SidebarLink {...link} to={paths.dashboard(id)} icon="squares-four" label="Dashboard" />
            <SidebarLink
              {...link}
              to={paths.myWork(id)}
              icon="list-checks"
              label="My work"
              count={counts.myWork}
            />
            <Divider compact={compact} />
            <SidebarLink
              {...link}
              to={paths.requirements(id)}
              icon="file-text"
              label="Requirements"
              count={approve ? counts.pendingReview : undefined}
              line
            />
            <SidebarLink
              {...link}
              to={paths.scenarios(id)}
              icon="flow-arrow"
              label="Test scenarios"
              line
            />
            <SidebarLink
              {...link}
              to={paths.testCases(id)}
              icon="check-square"
              label="Test cases"
              line
            />
            <SidebarLink {...link} to={paths.runs(id)} icon="play-circle" label="Test runs" line />
            <SidebarLink
              {...link}
              to={paths.defects(id)}
              icon="bug"
              label="Defects"
              count={counts.openDefects}
              alert
            />
            {trace && (
              <SidebarLink
                {...link}
                to={paths.traceability(id)}
                icon="tree-structure"
                label="Traceability"
              />
            )}
          </>
        ) : (
          <SidebarLink {...link} to={paths.defects(id)} icon="bug" label="Your defects" />
        )}
        {manage && (
          <>
            <Divider compact={compact} />
            <SidebarLink {...link} to={paths.reports(id)} icon="chart-bar" label="Reports" />
            <SidebarLink {...link} to={paths.members(id)} icon="users" label="Members" />
            <SidebarLink
              {...link}
              to={paths.activity(id)}
              icon="clock-counter-clockwise"
              label="Activity log"
            />
            <SidebarLink
              {...link}
              to={paths.settings(id)}
              icon="gear-six"
              label="Project settings"
            />
          </>
        )}
      </nav>
      <SidebarFooter
        name={user.name}
        role={roleLabels[project.role]}
        compact={compact}
        collapsed={collapsed}
        onToggle={desktop ? onToggle : undefined}
        controls="sidebar"
      />
    </div>
  );
}
