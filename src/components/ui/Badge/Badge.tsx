import type { ReactNode } from 'react';

import { cn } from '@/lib';

export type Tone = 'neutral' | 'ok' | 'bad' | 'warn' | 'progress' | 'ai' | 'bad-fill';

const tones: Record<Tone, string> = {
  neutral: 'bg-neutral-bg text-text-2',
  ok: 'bg-ok-bg text-ok',
  bad: 'bg-bad-bg text-bad',
  warn: 'bg-warn-bg text-warn',
  progress: 'bg-sel text-primary',
  ai: 'border border-ai-border bg-ai-bg text-ai-ink',
  'bad-fill': 'bg-bad-fill text-on-bad',
};

type Props = {
  tone?: Tone;
  children: ReactNode;
  className?: string;
};

export function Badge({ tone = 'neutral', children, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.25 rounded-sm px-2 py-px text-badge whitespace-nowrap transition-theme',
        tones[tone],
        className,
      )}
    >
      {tone === 'ai' && (
        <span
          aria-hidden="true"
          className="size-1.75 shrink-0 rounded-full border-[1.5px] border-ai"
        />
      )}
      {children}
    </span>
  );
}
