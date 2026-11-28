import { cn } from '@/lib';

type Props = {
  name: string;
  size?: 24 | 32 | 36 | 40;
  alt?: string;
  className?: string;
};

const sizes = {
  24: 'size-6 text-micro',
  32: 'size-8 text-badge',
  36: 'size-9 text-badge',
  40: 'size-10 text-label',
};

function initials(name: string) {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function Avatar({ name, size = 32, alt, className }: Props) {
  return (
    <span
      {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full bg-primary-fill text-on-p transition-theme',
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
