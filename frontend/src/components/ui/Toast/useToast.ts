import { useContext } from 'react';

import { ToastContext } from './context';

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error('useToast needs a ToastProvider above it');
  return toast;
}
