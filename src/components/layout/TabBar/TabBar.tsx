import { useState } from 'react';
import { useLocation } from 'react-router';

import { useCan, useProject } from '@/hooks';
import { demoCounts, paths } from '@/lib';

import { MoreSheet } from '../MoreSheet';
import { Tab, tabLook, TabMark } from './Tab';

export function TabBar() {
  const { pathname } = useLocation();
  const project = useProject();
  const workspace = useCan('workspace');
  const approve = useCan('approve');
  const [more, setMore] = useState(false);

  if (!project) return null;
  const id = project.projectId;
  const counts = demoCounts(id);
  const inTabs = [
    paths.dashboard,
    paths.myWork,
    approve ? paths.requirements : paths.runs,
    paths.defects,
  ]
    .map((to) => to(id))
    .some((to) => pathname === to || pathname.startsWith(`${to}/`));

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 grid auto-cols-fr grid-flow-col border-t border-border bg-surface pr-[max(0.25rem,env(safe-area-inset-right))] pb-[env(safe-area-inset-bottom)] pl-[max(0.25rem,env(safe-area-inset-left))] transition-[background-color,border-color,translate,visibility] duration-300 ease-standard group-data-detail:invisible group-data-detail:translate-y-[110%] tablet:hidden"
    >
      {workspace ? (
        <>
          <Tab to={paths.dashboard(id)} icon="squares-four" label="Home" />
          <Tab to={paths.myWork(id)} icon="list-checks" label="My work" count={counts.myWork} />
          {approve ? (
            <Tab
              to={paths.requirements(id)}
              icon="file-text"
              label="Requirements"
              count={counts.pendingReview}
            />
          ) : (
            <Tab to={paths.runs(id)} icon="play-circle" label="Test runs" />
          )}
          <Tab to={paths.defects(id)} icon="bug" label="Defects" count={counts.openDefects} alert />
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={more}
            aria-current={inTabs ? undefined : 'page'}
            onClick={() => setMore(true)}
            className={tabLook}
          >
            <TabMark icon="dots" />
            More
          </button>
          <MoreSheet open={more} onClose={() => setMore(false)} />
        </>
      ) : (
        <>
          <Tab to={paths.defects(id)} icon="bug" label="Your defects" />
          <Tab to={paths.search} icon="magnifying-glass" label="Search" />
          <Tab to={paths.notifications} icon="bell" label="Alerts" />
          <Tab to={paths.account} icon="user" label="Account" />
        </>
      )}
    </nav>
  );
}
