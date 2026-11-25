import { NavLink } from 'react-router';

import { Icon, type IconName } from '@/components/domain/Icon';
import { cn } from '@/lib';

type Props = {
  to: string;
  icon: IconName;
  label: string;
  count?: number | undefined;
  alert?: boolean;
  line?: boolean;
  end?: boolean;
};

export function MoreLink({
  to,
  icon,
  label,
  count,
  alert = false,
  line = false,
  end = false,
}: Props) {
  const hasCount = count !== undefined && count > 0;

  return (
    <NavLink
      to={to}
      end={end}
      className="group relative flex min-h-12 w-full items-center gap-3 rounded-panel px-2 text-title font-medium text-text no-underline active:bg-subtle aria-[current=page]:bg-sel aria-[current=page]:font-semibold"
    >
      <Icon
        name={icon}
        size={18}
        className={cn(
          'relative z-10 text-text-2 group-aria-[current=page]:text-primary',
          line &&
            'rounded-full bg-surface ring-3 ring-surface group-aria-[current=page]:bg-sel group-aria-[current=page]:ring-sel',
        )}
      />
      <span className="min-w-0 flex-1">{label}</span>
      {hasCount && ' '}
      {hasCount && (
        <span
          className={cn(
            'rounded-pill px-1.75 py-px text-badge leading-4',
            alert ? 'bg-bad-fill text-on-bad' : 'bg-subtle text-text',
          )}
        >
          {count}
        </span>
      )}
      {line && (
        <span aria-hidden="true" className="absolute top-9 left-[16.25px] h-6 w-[1.5px] bg-track" />
      )}
    </NavLink>
  );
}
