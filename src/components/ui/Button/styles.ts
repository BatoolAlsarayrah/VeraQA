import { cn } from '@/lib';

export type Variant = 'primary' | 'secondary' | 'danger' | 'danger-fill' | 'ghost' | 'ai';
export type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'border border-primary bg-primary-fill text-on-p shadow-ledge-primary hover:bg-primary-hover active:translate-y-0.75 active:shadow-none',
  secondary:
    'bg-surface text-text shadow-ledge-secondary hover:bg-subtle active:translate-y-0.5 active:shadow-ledge-secondary-pressed',
  danger:
    'bg-surface text-bad shadow-ledge-danger hover:bg-bad-bg active:translate-y-0.5 active:shadow-ledge-danger-pressed',
  'danger-fill':
    'bg-bad-fill text-on-bad shadow-ledge-danger-fill hover:bg-bad-fill-hover active:translate-y-0.5 active:shadow-none',
  ghost: 'text-text-2 hover:bg-subtle',
  ai: 'border border-ai-border bg-ai-bg text-ai-ink hover:bg-ai-hover active:translate-y-px',
};

const inactive = 'cursor-not-allowed bg-subtle text-text-3';

const sizes: Record<Size, string> = {
  sm: 'min-h-9 px-3 text-label tablet:min-h-8',
  md: 'min-h-11 px-4 text-body-strong tablet:min-h-10',
  lg: 'min-h-11 px-4 text-body-strong',
};

const squares: Record<Size, string> = {
  sm: 'size-9',
  md: 'size-11 tablet:size-10',
  lg: 'size-11',
};

type Options = {
  variant: Variant;
  size: Size;
  iconOnly: boolean;
  disabled?: boolean;
  className?: string | undefined;
};

export function buttonClass({ variant, size, iconOnly, disabled, className }: Options) {
  return cn(
    'relative inline-flex shrink-0 items-center justify-center gap-2 rounded-control whitespace-nowrap no-underline transition-press',
    disabled ? inactive : variants[variant],
    iconOnly ? squares[size] : sizes[size],
    className,
  );
}
