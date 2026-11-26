import { Link } from 'react-router';

import { IdText } from '@/components/domain/IdText';
import { cn, paths } from '@/lib';

export type Notice = {
  id: string;
  title: string;
  detail?: string | null;
  time: string;
  to: string;
  unread: boolean;
};

type Props = {
  notices: Notice[];
  onOpen?: ((id: string) => void) | undefined;
  activity?: string | undefined;
};

export function NotificationList({ notices, onOpen, activity }: Props) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="text-title font-semibold text-text">Notifications</h2>
        {activity && (
          <Link to={activity} className="text-label text-primary no-underline hover:underline">
            All activity
          </Link>
        )}
      </div>
      <ul>
        {notices.slice(0, 6).map((notice) => (
          <li key={notice.id}>
            <Link
              to={notice.to}
              onClick={() => {
                if (notice.unread) onOpen?.(notice.id);
              }}
              className="flex items-start gap-2.5 px-4 py-2.5 text-text no-underline transition-[background-color] duration-150 hover:bg-subtle"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'mt-1.5 size-1.75 shrink-0 rounded-full',
                  notice.unread ? 'bg-primary' : 'border-[1.5px] border-border-2',
                )}
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-body-sm">
                  <IdText>{notice.title}</IdText>
                  {notice.unread && <span className="sr-only">, unread</span>}
                </span>
                {notice.detail && (
                  <span className="text-caption text-text-3">
                    <IdText>{notice.detail}</IdText>
                  </span>
                )}
                <span className="text-caption text-text-3">{notice.time}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        to={paths.notifications}
        className="border-t border-border px-4 py-2.5 text-center text-label text-primary no-underline hover:underline"
      >
        See all notifications
      </Link>
    </div>
  );
}
