import { PageHeader } from '@/components/layout';
import { Button, Field, FormError, PasswordInput } from '@/components/ui';
import { useApiForm } from '@/hooks';
import { HttpError } from '@/lib';
import { NewPassword } from '@/types';

import { resetPassword } from '../api';

type Props = {
  token: string;
  onChanged: () => void;
  onExpired: () => void;
};

export function NewPasswordForm({ token, onChanged, onExpired }: Props) {
  const { form, onSubmit, error, busy } = useApiForm({
    schema: NewPassword,
    defaultValues: { password: '', confirm: '' },
    submit: async ({ password }) => {
      try {
        await resetPassword({ token, password });
        return 'changed';
      } catch (reason) {
        if (reason instanceof HttpError && reason.status === 410) return 'expired';
        throw reason;
      }
    },
    onSuccess: (result) => (result === 'changed' ? onChanged() : onExpired()),
  });
  const { errors } = form.formState;

  return (
    <>
      <PageHeader title="Choose a new password" />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormError message={error} />
        <Field
          label="New password"
          error={errors.password?.message}
          help={errors.password ? undefined : 'At least 8 characters, with a number.'}
        >
          <PasswordInput autoComplete="new-password" {...form.register('password')} />
        </Field>
        <Field label="Confirm password" error={errors.confirm?.message}>
          <PasswordInput autoComplete="new-password" {...form.register('confirm')} />
        </Field>
        <Button type="submit" variant="primary" size="lg" loading={busy} className="w-full">
          Save new password
        </Button>
      </form>
    </>
  );
}
