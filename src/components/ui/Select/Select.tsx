import type { ComponentProps } from 'react';

import { Icon } from '@/components/domain/Icon';
import { cn } from '@/lib';

import { fieldClass, useControl } from '../Field';

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  const control = useControl(props);

  return (
    <span className={cn('relative flex', className)}>
      <select
        {...props}
        {...control}
        className={cn(
          fieldClass,
          'min-h-10 cursor-pointer appearance-none bg-surface py-2 pr-9 pl-3',
        )}
      >
        {children}
      </select>
      <Icon
        name="caret-up-down"
        size={16}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-text-3"
      />
    </span>
  );
}
