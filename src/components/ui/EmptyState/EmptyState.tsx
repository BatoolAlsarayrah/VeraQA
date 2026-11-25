import type { ReactNode } from 'react';

import { cn } from '@/lib';

type Props = {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, children, action, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1.5 px-6 py-10 text-center text-text-2',
        className,
      )}
    >
      <span aria-hidden="true" className="mb-2 flex items-center">
        <span className="size-3 rounded-full border-3 border-line-l bg-surface" />
        <span className="h-0.75 w-8 bg-line-l" />
        <span className="size-3 rounded-full border-3 border-line-l bg-surface" />
      </span>
      <p className="text-title text-text">{title}</p>
      {children && <div className="max-w-[60ch]">{children}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
