import type { ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib';

type Props = {
  title?: string;
  children: ReactNode;
  accepted?: boolean;
  onAccept?: () => void;
  onEdit?: () => void;
  className?: string;
};

export function AiSuggestion({
  title = 'Suggested rewrite',
  children,
  accepted = false,
  onAccept,
  onEdit,
  className,
}: Props) {
  const actions = !accepted && (onAccept || onEdit);

  return (
    <section
      className={cn(
        'flex flex-col gap-2 rounded-control px-5 py-4 transition-[background-color] duration-400',
        accepted ? 'bg-ok-bg' : 'bg-ai-bg',
        className,
      )}
    >
      <h3 className={cn('text-label', accepted ? 'text-ok' : 'text-ai-ink')}>
        {accepted ? `${title} ` : title}
        {accepted && (
          <span className="text-caption font-medium">· accepted, still needs your approval</span>
        )}
      </h3>
      <p
        className={cn(
          'text-body text-text [&_del]:text-text-3 [&_del]:decoration-[1.5px] [&_ins]:underline [&_ins]:decoration-[1.5px] [&_ins]:underline-offset-3',
          accepted
            ? '[&_del]:hidden [&_ins]:font-medium [&_ins]:decoration-ok'
            : '[&_ins]:font-semibold [&_ins]:text-ai-ink [&_ins]:decoration-ai-border',
        )}
      >
        {children}
      </p>
      {actions && (
        <div className="mt-1 flex flex-wrap gap-2">
          {onAccept && (
            <Button variant="ai" size="sm" onClick={onAccept}>
              Accept rewrite
            </Button>
          )}
          {onEdit && (
            <Button size="sm" onClick={onEdit}>
              Edit text
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
