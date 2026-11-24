import { type ReactNode, useId } from 'react';

import { cn } from '@/lib';

type Props = {
  title?: string;
  actions?: ReactNode;
  list?: boolean;
  level?: 2 | 3;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, actions, list = false, level = 2, children, className }: Props) {
  const id = useId();
  const Heading = level === 2 ? 'h2' : 'h3';
  const header = (title || actions) && (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3',
        list && 'border-b border-border px-4 py-3.75 tablet:px-6',
      )}
    >
      {title && (
        <Heading id={id} className="text-title text-text">
          {title}
        </Heading>
      )}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );

  return (
    <section
      aria-labelledby={title ? id : undefined}
      className={cn(
        'flex min-w-0 flex-col rounded-panel border border-border bg-surface transition-theme',
        !list && 'gap-4 p-4 tablet:px-6 tablet:py-5',
        className,
      )}
    >
      {header}
      {children}
    </section>
  );
}
