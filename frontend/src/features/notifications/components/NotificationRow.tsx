import { Link } from 'react-router';

import { Avatar, TextWithIds } from '@/components/domain';
import { cn, when } from '@/lib';
import type { Notification } from '@/types';

import { notificationPath } from '../path';

type Props = {
  projectId: string;
  notification: Notification;
  now: number;
  onRead: (id: string) => void;
};

export function NotificationRow({ projectId, notification, now, onRead }: Props) {
  const { id, title, detail, unread, actor } = notification;

  return (
    <li className="border-t border-border first:border-t-0">
      <Link
        to={notificationPath(projectId, notification.target)}
        onClick={() => {
          if (unread) onRead(id);
        }}
        className={cn(
          'grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-0.5 px-4 py-3 text-text no-underline transition-colors tablet:grid-cols-[auto_minmax(0,1fr)_auto] tablet:px-5',
          unread ? 'bg-sel hover:bg-sel' : 'hover:bg-subtle',
        )}
      >
        <Avatar
          name={actor.type === 'ai' ? 'AI' : actor.name}
          tone={actor.type === 'ai' ? 'ai' : 'person'}
          size={32}
          className="row-span-2"
        />
        <span className={cn('min-w-0', unread ? 'font-semibold' : 'font-medium')}>
          <TextWithIds>{title}</TextWithIds>
          {unread && <span className="sr-only"> Unread</span>}
        </span>
        <span className="text-caption whitespace-nowrap text-text-2 max-tablet:col-start-2 max-tablet:row-start-3 tablet:row-span-2">
          {when(notification.at, now)}
        </span>
        {detail && (
          <span className="min-w-0 text-body-sm text-text-2 max-tablet:col-start-2">
            <TextWithIds>{detail}</TextWithIds>
          </span>
        )}
      </Link>
    </li>
  );
}
