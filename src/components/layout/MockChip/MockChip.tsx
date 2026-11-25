import { cn } from '@/lib';

type Props = {
  compact?: boolean;
  className?: string;
};

export function MockChip({ compact = false, className }: Props) {
  if (import.meta.env.VITE_API_MODE !== 'mock') return null;

  return (
    <span
      className={cn(
        'shrink-0 rounded-pill border border-border bg-subtle whitespace-nowrap text-text-2',
        compact ? 'px-1.5 text-micro leading-3.5' : 'px-2 text-badge',
        className,
      )}
    >
      Mock data
    </span>
  );
}
