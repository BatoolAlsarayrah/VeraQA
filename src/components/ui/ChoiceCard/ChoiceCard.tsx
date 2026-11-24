import { type ComponentProps, useId } from 'react';

import { cn } from '@/lib';

type Props = Omit<ComponentProps<'input'>, 'type' | 'title'> & {
  title: string;
  caption?: string;
};

export function ChoiceCard({ title, caption, className, ...props }: Props) {
  const id = useId();

  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-2.5 rounded-control border border-border-2 p-3 transition-theme has-checked:border-primary has-checked:bg-sel',
        className,
      )}
    >
      <input
        {...props}
        type="radio"
        aria-labelledby={`${id}-title`}
        aria-describedby={caption ? `${id}-caption` : undefined}
        className="mt-0.5 size-4 shrink-0 accent-primary-fill"
      />
      <span className="flex min-w-0 flex-col">
        <span id={`${id}-title`} className="text-body-strong text-text">
          {title}
        </span>
        {caption && (
          <span id={`${id}-caption`} className="text-caption text-text-2">
            {caption}
          </span>
        )}
      </span>
    </label>
  );
}
