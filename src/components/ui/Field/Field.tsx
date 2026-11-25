import { type ReactNode, useId } from 'react';

import { cn } from '@/lib';

import { FieldContext } from './context';

type Props = {
  label: string;
  help?: string;
  error?: string | undefined;
  optional?: boolean;
  children: ReactNode;
  className?: string;
};

export function Field({ label, help, error, optional = false, children, className }: Props) {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy = [error && errorId, help && helpId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-label text-text">
        {optional ? `${label} ` : label}
        {optional && <span className="font-normal text-text-3">(optional)</span>}
      </label>
      <FieldContext value={{ id, describedBy, invalid: Boolean(error), required: !optional }}>
        {children}
      </FieldContext>
      {error && (
        <p id={errorId} className="text-body-sm text-bad">
          {error}
        </p>
      )}
      {help && (
        <p id={helpId} className="text-caption text-text-3">
          {help}
        </p>
      )}
    </div>
  );
}
