import type { ReactNode } from 'react';

import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib';

type Props = {
  title: string;
  lede?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string };
  className?: string;
};

export function PageHeader({ title, lede, actions, back, className }: Props) {
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {back && <BackButton to={back.to} label={back.label} />}
        <div className="min-w-0">
          <h1 className="text-headline text-balance text-text">{title}</h1>
          {lede && <p className="mt-1 max-w-[68ch] text-pretty text-text-2">{lede}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
