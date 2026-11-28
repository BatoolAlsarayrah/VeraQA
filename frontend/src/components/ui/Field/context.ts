import { createContext, useContext } from 'react';

type FieldState = {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
};

export const FieldContext = createContext<FieldState | null>(null);

export function useField() {
  return useContext(FieldContext);
}
