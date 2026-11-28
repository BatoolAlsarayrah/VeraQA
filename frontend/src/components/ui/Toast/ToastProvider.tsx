import { type ReactNode, useCallback, useState } from 'react';

import { ToastContext, type ToastOptions } from './context';
import { Toast } from './Toast';

type Current = {
  id: number;
  message: string;
  undo?: (() => void) | undefined;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Current | null>(null);

  const toast = useCallback((message: string, options?: ToastOptions) => {
    setCurrent({ id: Date.now(), message, undo: options?.undo });
  }, []);

  const done = useCallback(() => setCurrent(null), []);

  return (
    <ToastContext value={toast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--toast-offset,1.5rem)+env(safe-area-inset-bottom))] z-60 flex justify-center px-4"
      >
        {current && (
          <Toast key={current.id} message={current.message} onUndo={current.undo} onDone={done} />
        )}
      </div>
    </ToastContext>
  );
}
