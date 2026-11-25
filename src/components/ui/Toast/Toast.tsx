import { useCallback, useEffect, useRef } from 'react';

type Props = {
  message: string;
  onUndo?: (() => void) | undefined;
  onDone: () => void;
};

export function Toast({ message, onUndo, onDone }: Props) {
  const remaining = useRef(onUndo ? 6000 : 2600);
  const started = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  const start = useCallback(() => {
    window.clearTimeout(timer.current);
    started.current = Date.now();
    timer.current = window.setTimeout(onDone, remaining.current);
  }, [onDone]);

  const pause = useCallback(() => {
    if (timer.current === undefined) return;
    window.clearTimeout(timer.current);
    timer.current = undefined;
    remaining.current -= Date.now() - started.current;
  }, []);

  useEffect(() => {
    start();
    return () => window.clearTimeout(timer.current);
  }, [start]);

  return (
    <div
      onPointerEnter={pause}
      onPointerLeave={start}
      onFocus={pause}
      onBlur={start}
      className="pointer-events-auto flex max-w-full animate-toast items-center gap-3 rounded-panel bg-text px-4.5 py-2.5 text-body-sm font-medium text-bg shadow-pop"
    >
      <span>{message}</span>
      {onUndo && (
        <button
          type="button"
          onClick={() => {
            onUndo();
            onDone();
          }}
          className="cursor-pointer font-semibold underline underline-offset-3 focus-visible:outline-bg"
        >
          Undo
        </button>
      )}
    </div>
  );
}
