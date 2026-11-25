import { NavLink } from 'react-router';

import { Icon, type IconName } from '@/components/domain/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib';

type Props = {
  to: string;
  icon: IconName;
  label: string;
  count?: number | undefined;
  alert?: boolean;
  compact: boolean;
  end?: boolean;
  line?: boolean;
};

export function SidebarLink({ to, icon, label, count, alert = false, compact, end, line }: Props) {
  const hasCount = count !== undefined && count > 0;
  const link = (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'group relative flex h-9 items-center gap-2.5 rounded-sm text-body-strong transition-[background-color,color] duration-150',
          compact ? 'w-10 justify-center' : 'w-full px-2.5',
          isActive
            ? 'bg-rail-on font-semibold text-on-rail'
            : 'font-medium text-on-rail-2 hover:bg-rail-2/70 hover:text-on-rail',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            name={icon}
            className={cn(
              'relative z-10',
              isActive ? 'text-on-rail' : 'text-on-rail-3 group-hover:text-on-rail',
            )}
          />
          <span className={compact ? 'sr-only' : 'min-w-0 flex-1 truncate'}>{label}</span>
          {hasCount && ' '}
          {hasCount &&
            (compact ? (
              <>
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-1.5 right-2 size-1.5 rounded-full ring-2 ring-rail',
                    alert ? 'bg-bad-fill' : 'bg-on-rail',
                  )}
                />
                <span className="sr-only">{count}</span>
              </>
            ) : (
              <span
                className={cn(
                  'min-w-5 rounded-pill px-1.5 py-px text-center text-micro font-bold',
                  alert ? 'bg-bad-fill text-on-bad' : 'bg-rail-2 text-on-rail',
                )}
              >
                {count}
              </span>
            ))}
          {line && (
            <span
              aria-hidden="true"
              className={cn(
                'absolute top-7.5 h-3.5 w-[1.5px] bg-on-rail-3',
                compact ? 'left-[19.25px]' : 'left-[18.25px]',
              )}
            />
          )}
        </>
      )}
    </NavLink>
  );

  return compact ? <Tooltip label={label}>{link}</Tooltip> : link;
}
