import { cn } from '@/lib';

export type MarkerState = 'draft' | 'approved' | 'approved-case' | 'rejected';

const states: Record<MarkerState, { label: string; look: string }> = {
  draft: { label: 'AI draft', look: 'size-3 rounded-full border-2 border-ai bg-surface' },
  approved: { label: 'Approved', look: 'size-3 rounded-full border-2 border-ok-fill bg-ok-fill' },
  'approved-case': {
    label: 'Approved',
    look: 'size-3 rounded-full border-2 border-primary bg-primary',
  },
  rejected: { label: 'Rejected', look: 'h-1 w-3 rounded-inner bg-bad-fill' },
};

type Props = {
  state: MarkerState;
  className?: string;
};

export function RowMarker({ state, className }: Props) {
  const { label, look } = states[state];

  return (
    <span className={cn('inline-flex size-3 shrink-0 items-center justify-center', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'block transition-[background-color,border-color] duration-400 ease-standard',
          look,
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
