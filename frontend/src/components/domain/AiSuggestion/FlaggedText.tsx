import type { ReactNode } from 'react';

import { cn } from '@/lib';

type Props = {
  findings: number[];
  active?: boolean;
  children: ReactNode;
  className?: string;
};

export function FlaggedText({ findings, active = false, children, className }: Props) {
  return (
    <mark
      className={cn(
        'rounded-inner px-0.75 py-px text-ai-ink underline decoration-ai-border decoration-[1.5px] underline-offset-4 transition-[background-color] duration-200',
        active ? 'bg-ai-active' : 'bg-ai-bg',
        className,
      )}
    >
      {children}
      <sup className="text-micro leading-none">
        <span className="sr-only"> finding </span>
        {findings.join(',')}
      </sup>
    </mark>
  );
}
