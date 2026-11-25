import { Link } from 'react-router';

import { Avatar } from '@/components/domain/Avatar';
import { paths } from '@/lib';
import type { User } from '@/types';

type Props = {
  user: User;
  role?: { label: string; project: string } | undefined;
  settings?: string | undefined;
  solo?: boolean;
};

const row =
  'flex min-h-9 items-center rounded-sm px-2.5 text-body no-underline transition-[background-color] duration-150 hover:bg-subtle';

export function AccountCard({ user, role, settings, solo = false }: Props) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2.5">
        <Avatar name={user.name} size={36} />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-label text-text">{user.name}</span>
          <span className="truncate text-caption text-text-2">{user.email}</span>
        </div>
      </div>
      {role && (
        <p className="px-4 pb-2.5 text-body-sm text-text-2">
          {role.label} in <span className="font-semibold">{role.project}</span>
        </p>
      )}
      <div className="flex flex-col border-y border-border p-1.5">
        <Link to={paths.account} className={`${row} text-text`}>
          Account settings
        </Link>
        {settings && (
          <Link to={settings} className={`${row} text-text`}>
            Project settings
          </Link>
        )}
        {!solo && (
          <Link to={paths.projects} className={`${row} text-text`}>
            Switch project
          </Link>
        )}
      </div>
      <div className="flex flex-col p-1.5">
        <Link to={paths.signin} className={`${row} text-bad hover:bg-bad-bg`}>
          Sign out
        </Link>
      </div>
    </div>
  );
}
