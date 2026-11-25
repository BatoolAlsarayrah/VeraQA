import { cn } from '@/lib';

type Props = {
  size?: 24 | 32 | 40;
  withName?: boolean;
  tone?: 'color' | 'ink';
  className?: string;
};

const tones = {
  color: { line: 'stroke-line', node: 'fill-line', end: 'fill-logo-end' },
  ink: { line: 'stroke-on-rail', node: 'fill-on-rail', end: 'fill-line' },
};

export function Logo({ size = 40, withName = false, tone = 'color', className }: Props) {
  const colors = tones[tone];
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className="shrink-0"
      {...(withName ? { 'aria-hidden': true } : { role: 'img', 'aria-label': 'VeraQA' })}
    >
      <path
        d="M5 16L12.5 23.5L27 8"
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".7"
        className={colors.line}
      />
      <circle cx="5" cy="16" r="3.6" className={colors.node} />
      <circle cx="12.5" cy="23.5" r="3.6" className={colors.node} />
      <circle cx="27" cy="8" r="4.2" className={colors.end} />
    </svg>
  );

  if (!withName) return <span className={cn('inline-flex', className)}>{mark}</span>;

  return (
    <span
      className={cn(
        'inline-flex items-center',
        size === 40 ? 'gap-3 text-wordmark' : 'gap-2.5 text-dialog-title',
        className,
      )}
    >
      {mark}
      VeraQA
    </span>
  );
}
