import { cn } from '@/lib';

import { type IconName, type IconPath, icons } from './icons';

type Props = {
  name: IconName;
  size?: 16 | 18 | 24;
  label?: string;
  className?: string;
};

export function Icon({ name, size = 18, label, className }: Props) {
  const paths: IconPath[] = icons[name];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      focusable="false"
      className={cn('shrink-0', className)}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      {paths.map((path) =>
        path.stroke ? (
          <path
            key={path.d}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            key={path.d}
            d={path.d}
            fill="currentColor"
            opacity={path.opacity}
            fillRule={path.evenOdd ? 'evenodd' : undefined}
            clipRule={path.evenOdd ? 'evenodd' : undefined}
          />
        ),
      )}
    </svg>
  );
}
