import type { ComponentProps } from 'react';

import { cn } from '@/lib';

import { fieldClass, useControl } from '../Field';

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  const control = useControl(props);

  return (
    <textarea
      {...props}
      {...control}
      className={cn(fieldClass, 'min-h-24 resize-y bg-field px-3 py-2.5', className)}
    />
  );
}
