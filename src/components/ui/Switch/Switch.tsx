import { type ComponentProps, useId } from 'react';

import { cn } from '@/lib';

type Props = Omit<ComponentProps<'input'>, 'type' | 'role'> & {
  label: string;
  description?: string;
  locked?: boolean;
};

function keepOn() {}

export function Switch({ label, description, locked = false, className, ...props }: Props) {
  const id = useId();
  const describedBy = [description && `${id}-description`, locked && `${id}-locked`]
    .filter(Boolean)
    .join(' ');

  return (
    <label
      className={cn(
        'flex items-start gap-3',
        locked ? 'cursor-default' : 'cursor-pointer',
        className,
      )}
    >
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          {...props}
          {...(locked && { checked: true, onChange: keepOn })}
          type="checkbox"
          role="switch"
          aria-labelledby={`${id}-label`}
          aria-disabled={locked || undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            'peer h-5 w-9 appearance-none rounded-pill transition-[background-color] duration-200',
            locked ? 'bg-sel-border' : 'cursor-pointer bg-border-2 checked:bg-primary-fill',
          )}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0.5 left-0.5 size-4 rounded-full bg-on-p transition-transform duration-250 ease-standard peer-checked:translate-x-4"
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span id={`${id}-label`} className="text-body-strong text-text">
          {label}
        </span>
        {description && (
          <span id={`${id}-description`} className="text-body-sm text-text-2">
            {description}
          </span>
        )}
      </span>
      {locked && (
        <span id={`${id}-locked`} className="shrink-0 text-caption text-text-3">
          Always on
        </span>
      )}
    </label>
  );
}
