import { useField } from './context';

type Own = {
  id?: string | undefined;
  'aria-describedby'?: string | undefined;
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling' | undefined;
  'aria-required'?: boolean | 'true' | 'false' | undefined;
};

export function useControl(own: Own) {
  const field = useField();
  return {
    id: own.id ?? field?.id,
    'aria-describedby': own['aria-describedby'] ?? field?.describedBy,
    'aria-invalid': own['aria-invalid'] ?? (field?.invalid || undefined),
    'aria-required': own['aria-required'] ?? (field?.required || undefined),
  };
}

export const fieldClass =
  'w-full rounded-sm border border-border-2 text-body-lg text-text tablet:text-body transition-theme placeholder:text-text-3 hover:border-text-3 aria-invalid:border-bad-fill aria-invalid:shadow-field-error';
