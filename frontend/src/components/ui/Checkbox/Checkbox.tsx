import type { ComponentProps, ReactNode } from 'react';

import { Icon } from '@/components/domain/Icon';
import { cn } from '@/lib';

type Props = Omit<ComponentProps<'input'>, 'type'> & {
  label?: ReactNode;
};

export function Checkbox({ label, className, ...props }: Props) {
  const box = (
    <span className="relative inline-grid size-4.5 shrink-0 place-items-center">
      <input
        {...props}
        type="checkbox"
        className="peer size-4.5 cursor-pointer appearance-none rounded-inner border border-border-2 bg-surface transition-theme checked:border-primary-fill checked:bg-primary-fill"
      />
      <Icon
        name="check"
        size={14}
        className="pointer-events-none absolute hidden text-on-p peer-checked:block"
      />
    </span>
  );

  if (!label) return <span className={cn('inline-flex', className)}>{box}</span>;

  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2 text-body', className)}>
      {box}
      {label}
    </label>
  );
}
