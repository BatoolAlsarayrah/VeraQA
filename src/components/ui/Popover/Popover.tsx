import { type ReactNode, useEffect, useId, useRef } from 'react';

import { cn, place } from '@/lib';

type Trigger = {
  popoverTarget: string;
  'aria-haspopup': 'dialog';
};

type Props = {
  label: string;
  trigger: (props: Trigger) => ReactNode;
  align?: 'start' | 'end';
  children: ReactNode;
  className?: string;
};

export function Popover({ label, trigger, align = 'start', children, className }: Props) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = ref.current;
    if (!panel) return;

    function position() {
      if (!panel) return;
      const anchor = document.querySelector(`[popovertarget="${CSS.escape(id)}"]`);
      if (!anchor) return;
      const { top, left } = place(anchor.getBoundingClientRect(), panel.getBoundingClientRect(), {
        side: 'bottom',
        align,
        viewport: { width: window.innerWidth, height: window.innerHeight },
      });
      panel.style.top = `${top}px`;
      panel.style.left = `${left}px`;
    }

    function onToggle(event: Event) {
      const open = (event as Event & { newState?: string }).newState === 'open';
      if (open) {
        position();
        window.addEventListener('resize', position);
        window.addEventListener('scroll', position, true);
      } else {
        window.removeEventListener('resize', position);
        window.removeEventListener('scroll', position, true);
      }
    }

    function onClick(event: MouseEvent) {
      if (event.target instanceof Element && event.target.closest('a')) panel?.hidePopover();
    }

    panel.addEventListener('toggle', onToggle);
    panel.addEventListener('click', onClick);
    return () => {
      panel.removeEventListener('toggle', onToggle);
      panel.removeEventListener('click', onClick);
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
  }, [id, align]);

  return (
    <>
      {trigger({ popoverTarget: id, 'aria-haspopup': 'dialog' })}
      <div
        ref={ref}
        id={id}
        popover="auto"
        role="dialog"
        aria-label={label}
        className={cn(
          'inset-auto m-0 max-w-[calc(100vw-1rem)] overflow-hidden rounded-control border border-border bg-surface p-0 text-text shadow-pop open:animate-pop-in',
          align === 'end' ? 'origin-top-right' : 'origin-top-left',
          className,
        )}
      >
        {children}
      </div>
    </>
  );
}
