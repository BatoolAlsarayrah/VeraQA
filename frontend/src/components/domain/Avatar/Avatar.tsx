import { cn } from '@/lib';

type Props = {
  name: string;
  size?: 24 | 32 | 36 | 40;
  tone?: 'person' | 'ai';
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
  if (words.length === 1 && name.trim().length <= 2) return name.trim().toUpperCase();
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function Avatar({ name, size = 32, tone = 'person', alt, className }: Props) {
  return (
    <span
      {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full transition-theme',
        tone === 'ai' ? 'bg-text text-bg' : 'bg-primary-fill text-on-p',
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
