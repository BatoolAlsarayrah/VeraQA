import { cn } from '@/lib';

type Props = {
  lines?: number;
  shape?: 'line' | 'circle';
  className?: string;
};

export function Skeleton({ lines = 1, shape = 'line', className }: Props) {
  if (shape === 'circle') {
    return (
      <span
        aria-hidden="true"
        className={cn('block size-8 animate-skeleton rounded-full bg-neutral-bg', className)}
      />
    );
  }

  return (
    <span aria-hidden="true" className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }, (_, index) => (
        <span
          key={index}
          className={cn(
            'block h-3 animate-skeleton rounded-inner bg-neutral-bg',
            lines > 1 && index === lines - 1 && 'w-3/5',
          )}
        />
      ))}
    </span>
  );
}
