import { useCan, useProject, useSession } from '@/hooks';
import { demoNotifications, homePath, paths, roleLabels } from '@/lib';

import { AccountMenu, NotificationsMenu } from '../Menus';
import { Breadcrumb } from './Breadcrumb';
import { SearchField } from './SearchField';
import { ThemeButton } from './ThemeButton';
import { type Stage, WorkflowStrip } from './WorkflowStrip';

type Props = {
  stage?: Stage | undefined;
  crumb: string;
};

export function TopBar({ stage, crumb }: Props) {
  const { user } = useSession();
  const project = useProject();
  const workspace = useCan('workspace');
  const upload = useCan('upload');
  const manage = useCan('manage');

  if (!project) return null;
  const id = project.projectId;

  return (
    <header className="sticky top-0 z-30 flex min-h-15 items-center gap-3 border-b border-border bg-surface px-4 transition-theme max-tablet:hidden desktop:px-6">
      <div className="flex min-w-0 flex-1 items-center">
        {stage && workspace ? (
          <WorkflowStrip projectId={id} current={stage} canUpload={upload} />
        ) : (
          <Breadcrumb
            project={project.projectName}
            home={homePath(id, project.capabilities)}
            page={crumb}
          />
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <SearchField
          placeholder={workspace ? 'Search IDs, titles, people' : 'Search your defects'}
        />
        <ThemeButton />
        <NotificationsMenu
          notices={demoNotifications(id)}
          activity={manage ? paths.activity(id) : undefined}
        />
        <AccountMenu
          user={user}
          role={{ label: roleLabels[project.role], project: project.projectName }}
          settings={manage ? paths.settings(id) : undefined}
        />
      </div>
    </header>
  );
}
