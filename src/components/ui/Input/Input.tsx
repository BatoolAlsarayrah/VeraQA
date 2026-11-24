import type { ComponentProps } from 'react';

import { cn } from '@/lib';

import { fieldClass, useControl } from '../Field';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  const control = useControl(props);

  return (
    <input
      {...props}
      {...control}
      className={cn(fieldClass, 'min-h-10 bg-surface px-3 py-2', className)}
    />
  );
}
