import { Link, useNavigate } from 'react-router';

import { PageHeader } from '@/components/layout';
import { Button, Field, FormError, Input } from '@/components/ui';
import { useApiForm } from '@/hooks';
import { paths } from '@/lib';
import { ForgotPasswordInput } from '@/types';

import { askForReset } from '../api';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { form, onSubmit, error, busy } = useApiForm({
    schema: ForgotPasswordInput,
    defaultValues: { email: '' },
    submit: askForReset,
    onSuccess: (_, { email }) => navigate(paths.resetSent, { state: { email } }),
  });
  const { errors } = form.formState;

  return (
    <>
      <PageHeader
        title="Reset your password"
        lede="Enter the email you signed up with. We’ll send you a link to choose a new password."
      />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormError message={error} />
        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="name@company.com"
            {...form.register('email')}
          />
        </Field>
        <Button type="submit" variant="primary" size="lg" loading={busy} className="w-full">
          Send reset link
        </Button>
      </form>
      <Link to={paths.signin} className="self-start text-body-sm">
        Back to sign in
      </Link>
    </>
  );
}
