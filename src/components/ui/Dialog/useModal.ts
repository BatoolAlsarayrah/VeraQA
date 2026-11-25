import { type RefObject, useEffect, useEffectEvent, useRef } from 'react';

export function useModal(
  ref: RefObject<HTMLDialogElement | null>,
  open: boolean,
  onClose: () => void,
) {
  const returnTo = useRef<HTMLElement | null>(null);
  const close = useEffectEvent(() => onClose());
  const isOpen = useEffectEvent(() => open);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnTo.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [ref, open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    function onCancel(event: Event) {
      event.preventDefault();
      close();
    }
    function onClosed() {
      returnTo.current?.focus();
      if (isOpen()) close();
    }
    function onClick(event: MouseEvent) {
      if (event.target === dialog) close();
    }

    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('close', onClosed);
    dialog.addEventListener('click', onClick);
    return () => {
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('close', onClosed);
      dialog.removeEventListener('click', onClick);
    };
  }, [ref]);
}
