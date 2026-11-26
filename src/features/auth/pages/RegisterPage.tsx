import { Link, useNavigate } from 'react-router';

import { PageHeader } from '@/components/layout';
import { Button, Field, FormError, Input, PasswordInput } from '@/components/ui';
import { useApiForm } from '@/hooks';
import { paths } from '@/lib';
import { RegisterInput } from '@/types';

import { register } from '../api';

const rules = 'At least 8 characters, with a number.';

export function RegisterPage() {
  const navigate = useNavigate();
  const { form, onSubmit, error, busy } = useApiForm({
    schema: RegisterInput,
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
    submit: register,
    onSuccess: () => navigate(paths.projects, { replace: true }),
  });
  const { errors } = form.formState;

  return (
    <>
      <PageHeader
        title="Create your account"
        lede="It takes a minute. You can invite your team later."
      />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormError message={error} />
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="First name" error={errors.firstName?.message}>
            <Input autoComplete="given-name" {...form.register('firstName')} />
          </Field>
          <Field label="Last name" error={errors.lastName?.message}>
            <Input autoComplete="family-name" {...form.register('lastName')} />
          </Field>
        </div>
        <Field label="Work email" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="name@company.com"
            {...form.register('email')}
          />
        </Field>
        <Field
          label="Password"
          error={errors.password?.message}
          help={errors.password ? undefined : rules}
        >
          <PasswordInput autoComplete="new-password" {...form.register('password')} />
        </Field>
        <Button type="submit" variant="primary" size="lg" loading={busy} className="w-full">
          Create account
        </Button>
      </form>
      <p className="text-body-sm text-text-2">
        Already have an account? <Link to={paths.signin}>Sign in</Link>
      </p>
    </>
  );
}
