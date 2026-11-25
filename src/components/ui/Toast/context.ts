import { createContext } from 'react';

export type ToastOptions = {
  undo?: () => void;
};

export const ToastContext = createContext<
  ((message: string, options?: ToastOptions) => void) | null
>(null);
