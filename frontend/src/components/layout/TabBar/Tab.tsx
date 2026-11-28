import { NavLink } from 'react-router';

import { Icon, type IconName } from '@/components/domain/Icon';
import { cn } from '@/lib';

type Props = {
  to: string;
  icon: IconName;
  label: string;
  count?: number | undefined;
  alert?: boolean;
};

export const tabLook =
  'group relative flex h-16 cursor-pointer flex-col items-center justify-center gap-0.75 text-tab-label text-text-3 no-underline transition-colors duration-150 aria-[current=page]:font-semibold aria-[current=page]:text-text';

export function TabMark({ icon, count, alert = false }: Pick<Props, 'icon' | 'count' | 'alert'>) {
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute -top-px left-1/2 hidden h-0.5 w-8 -translate-x-1/2 animate-tab-line rounded-b-inner bg-primary group-aria-[current=page]:block"
      />
      <span className="relative block size-6 transition-transform duration-180 ease-standard group-active:scale-88">
        <Icon name={icon} size={24} className="group-aria-[current=page]:text-primary" />
        {count !== undefined && count > 0 && (
          <span
            aria-hidden="true"
            className={cn(
              'absolute -top-1.25 left-3.75 h-4.25 min-w-4.25 rounded-pill px-1 text-center text-micro leading-4.25 ring-2 ring-surface',
              alert ? 'bg-bad-fill text-on-bad' : 'bg-subtle text-text',
            )}
          >
            {count}
          </span>
        )}
      </span>
    </>
  );
}

export function Tab({ to, icon, label, count, alert }: Props) {
  return (
    <NavLink to={to} className={tabLook}>
      <TabMark icon={icon} count={count} alert={alert} />
      {label}
      {count !== undefined && count > 0 && <span className="sr-only">, {count}</span>}
    </NavLink>
  );
}
