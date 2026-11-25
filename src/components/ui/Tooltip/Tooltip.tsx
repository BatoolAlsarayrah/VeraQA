import { type ReactNode, useEffect, useRef } from 'react';

import { place } from '@/lib';

type Props = {
  label: string;
  children: ReactNode;
};

export function Tooltip({ label, children }: Props) {
  const wrapper = useRef<HTMLSpanElement>(null);
  const tip = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const anchor = wrapper.current;
    const panel = tip.current;
    if (!anchor || !panel) return;

    let open = false;

    function show() {
      if (!anchor || !panel || open) return;
      panel.showPopover();
      open = true;
      const { top, left } = place(anchor.getBoundingClientRect(), panel.getBoundingClientRect(), {
        side: 'right',
        viewport: { width: window.innerWidth, height: window.innerHeight },
      });
      panel.style.top = `${top}px`;
      panel.style.left = `${left}px`;
    }
    function hide() {
      if (!panel || !open) return;
      panel.hidePopover();
      open = false;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') hide();
    }

    anchor.addEventListener('pointerenter', show);
    anchor.addEventListener('pointerleave', hide);
    anchor.addEventListener('focusin', show);
    anchor.addEventListener('focusout', hide);
    anchor.addEventListener('keydown', onKey);
    return () => {
      anchor.removeEventListener('pointerenter', show);
      anchor.removeEventListener('pointerleave', hide);
      anchor.removeEventListener('focusin', show);
      anchor.removeEventListener('focusout', hide);
      anchor.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <span ref={wrapper} className="inline-flex">
      {children}
      <span
        ref={tip}
        popover="manual"
        aria-hidden="true"
        className="inset-auto m-0 rounded-sm bg-text px-2 py-1 text-caption font-medium whitespace-nowrap text-surface"
      >
        {label}
      </span>
    </span>
  );
}
