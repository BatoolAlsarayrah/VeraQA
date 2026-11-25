import { type ReactNode, useId, useRef } from 'react';

import { cn } from '@/lib';

import { useModal } from '../Dialog';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

export function Sheet({ open, onClose, title, children, className }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useModal(ref, open, onClose);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={cn(
        'top-auto bottom-0 m-0 max-h-[88dvh] w-full max-w-full overflow-auto rounded-t-sheet bg-surface px-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))] text-text backdrop:bg-scrim open:animate-sheet-rise',
        className,
      )}
    >
      <span aria-hidden="true" className="mx-auto mb-2.5 block h-1 w-9 rounded-pill bg-border-2" />
      <h2 id={titleId} className="mb-2 text-title text-text">
        {title}
      </h2>
      {children}
    </dialog>
  );
}
