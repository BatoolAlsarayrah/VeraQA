import { type FormEvent, type ReactNode, useId, useState } from 'react';

import { Button } from '../Button';
import { Field } from '../Field';
import { Input } from '../Input';
import { Dialog } from './Dialog';

type Typed = {
  label: string;
  value: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  variant?: 'primary' | 'danger-fill';
  typed?: Typed;
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  onClose,
  title,
  children,
  confirmLabel,
  onConfirm,
  variant = 'primary',
  typed,
  loading = false,
}: Props) {
  const formId = useId();
  const [text, setText] = useState('');
  const [error, setError] = useState<string>();
  const matches = !typed || text === typed.value;

  function close() {
    setText('');
    setError(undefined);
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!typed || matches) {
      onConfirm();
      return;
    }
    setError(`That doesn't match. Type ${typed.value} exactly.`);
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title={title}
      size="sm"
      actions={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            type="submit"
            form={formId}
            variant={variant}
            disabled={!matches}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
      <form id={formId} onSubmit={handleSubmit} noValidate>
        {typed && (
          <Field label={typed.label} error={error}>
            <Input
              value={text}
              autoComplete="off"
              onChange={(event) => {
                setText(event.target.value);
                setError(undefined);
              }}
            />
          </Field>
        )}
      </form>
    </Dialog>
  );
}
