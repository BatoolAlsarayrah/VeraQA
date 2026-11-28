import { type ReactNode, useId, useRef } from 'react';

import { cn } from '@/lib';

import { useModal } from './useModal';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  size?: 'md' | 'sm';
  className?: string;
};

export function Dialog({ open, onClose, title, children, actions, size = 'md', className }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useModal(ref, open, onClose);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={cn(
        'm-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-auto rounded-control bg-surface p-0 text-text shadow-pop backdrop:bg-scrim open:animate-rise',
        size === 'md' ? 'max-w-160' : 'max-w-120',
        className,
      )}
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id={titleId} className="text-dialog-title text-text">
          {title}
        </h2>
        {children && <div className="flex flex-col gap-4 text-body text-text-2">{children}</div>}
        {actions && <div className="flex flex-wrap justify-end gap-2">{actions}</div>}
      </div>
    </dialog>
  );
}
