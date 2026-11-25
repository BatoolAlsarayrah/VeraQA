import { Link } from 'react-router';

import { Avatar } from '@/components/domain/Avatar';
import { Icon } from '@/components/domain/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn, paths } from '@/lib';

type Props = {
  name: string;
  role: string;
  compact: boolean;
  collapsed: boolean;
  onToggle?: (() => void) | undefined;
  controls: string;
};

export function SidebarFooter({ name, role, compact, collapsed, onToggle, controls }: Props) {
  const person = (
    <Link
      to={paths.account}
      className="flex min-w-0 flex-1 items-center gap-2.5 rounded-control text-on-rail"
    >
      <Avatar name={name} />
      <span className={compact ? 'sr-only' : 'flex min-w-0 flex-col'}>
        <span className="truncate text-body-sm leading-4.5 font-medium">{name}</span>{' '}
        <span className="truncate text-caption text-on-rail-3">{role}</span>
      </span>
    </Link>
  );

  return (
    <div
      className={cn(
        'flex border-t border-rail-3 p-3',
        compact ? 'flex-col items-center gap-2' : 'items-center gap-2.5',
      )}
    >
      {compact ? <Tooltip label={name}>{person}</Tooltip> : person}
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-controls={controls}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-sm border border-rail-3 text-on-rail-2 transition-[background-color] duration-150 hover:bg-rail-2"
        >
          <Icon
            name="caret-double-left"
            className={cn(
              'transition-transform duration-300 ease-standard',
              collapsed && 'rotate-180',
            )}
          />
        </button>
      )}
    </div>
  );
}
