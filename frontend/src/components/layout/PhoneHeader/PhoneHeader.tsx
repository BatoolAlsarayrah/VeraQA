import { useState } from 'react';
import { Link } from 'react-router';

import { Avatar } from '@/components/domain/Avatar';
import { Icon } from '@/components/domain/Icon';
import { Logo } from '@/components/domain/Logo';
import { Sheet } from '@/components/ui/Sheet';
import { useCan, useProject, useSession } from '@/hooks';
import { paths, roleLabels } from '@/lib';

import { AccountCard, type Notice, NotificationList } from '../Menus';

type Props = {
  back?: { label: string; to: string } | undefined;
  notices: Notice[];
  onOpen?: ((id: string) => void) | undefined;
};

const left = 'flex min-h-11 min-w-0 flex-1 items-center gap-2.5 text-text no-underline';

const iconButton =
  'relative grid size-11 shrink-0 cursor-pointer place-items-center rounded-panel text-text-2 active:bg-subtle';

export function PhoneHeader({ back, notices, onOpen }: Props) {
  const { user } = useSession();
  const project = useProject();
  const workspace = useCan('workspace');
  const manage = useCan('manage');
  const [open, setOpen] = useState<'notifications' | 'account' | null>(null);

  if (!project) return null;
  const id = project.projectId;
  const unread = notices.filter((notice) => notice.unread).length;
  const close = () => setOpen(null);

  return (
    <header className="sticky top-0 z-30 flex min-h-[calc(3.5rem+env(safe-area-inset-top))] items-center gap-1 border-b border-border bg-surface pt-[env(safe-area-inset-top)] pr-1.5 pl-4 text-text transition-theme tablet:hidden">
      {back ? (
        <Link to={back.to} className={left}>
          <Icon name="chevron-left" size={24} />
          <span className="truncate text-title font-semibold">{back.label}</span>
        </Link>
      ) : (
        <Link
          to={paths.projects}
          aria-label={`Switch project, current project ${project.projectName}`}
          className={left}
        >
          <Logo size={24} />
          <span className="truncate text-title font-semibold">{project.projectName}</span>
          <Icon name="caret-up-down" size={16} className="text-text-3" />
        </Link>
      )}
      {workspace && (
        <>
          <Link to={paths.search} aria-label="Search" className={iconButton}>
            <Icon name="magnifying-glass" size={24} />
          </Link>
          <button
            type="button"
            aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
            onClick={() => setOpen('notifications')}
            className={iconButton}
          >
            <Icon name="bell" size={24} />
            {unread > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-2.5 right-2.5 size-2 rounded-full bg-bad-fill ring-2 ring-surface"
              />
            )}
          </button>
        </>
      )}
      <button
        type="button"
        aria-label={`Account, ${user.name}`}
        onClick={() => setOpen('account')}
        className="mr-1.5 ml-1 grid shrink-0 cursor-pointer place-items-center rounded-full"
      >
        <Avatar name={user.name} size={32} />
      </button>
      <Sheet open={open === 'notifications'} onClose={close} title="Notifications" titleHidden>
        <div className="-mx-4">
          <NotificationList
            notices={notices}
            onOpen={onOpen}
            activity={manage ? paths.activity(id) : undefined}
          />
        </div>
      </Sheet>
      <Sheet open={open === 'account'} onClose={close} title="Account" titleHidden>
        <div className="-mx-4">
          <AccountCard
            user={user}
            role={{ label: roleLabels[project.role], project: project.projectName }}
            settings={manage ? paths.settings(id) : undefined}
          />
        </div>
      </Sheet>
    </header>
  );
}
