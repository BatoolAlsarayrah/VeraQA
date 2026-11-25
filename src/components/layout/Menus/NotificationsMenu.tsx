import { Icon } from '@/components/domain/Icon';
import { Popover } from '@/components/ui/Popover';
import type { Notice } from '@/lib';

import { NotificationList } from './NotificationList';

type Props = {
  notices: Notice[];
  activity?: string | undefined;
};

export function NotificationsMenu({ notices, activity }: Props) {
  const unread = notices.filter((notice) => notice.unread).length;

  return (
    <Popover
      label="Notifications"
      align="end"
      className="w-90"
      trigger={(props) => (
        <button
          type="button"
          {...props}
          aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
          className="relative grid size-9 shrink-0 cursor-pointer place-items-center rounded-sm text-text-2 transition-[background-color,color] duration-150 hover:bg-subtle hover:text-text"
        >
          <Icon name="bell" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-2 right-2 size-1.75 rounded-full bg-bad-fill ring-[1.5px] ring-surface"
            />
          )}
        </button>
      )}
    >
      <NotificationList notices={notices} activity={activity} />
    </Popover>
  );
}
