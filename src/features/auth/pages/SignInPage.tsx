import { Link, useNavigate, useSearchParams } from 'react-router';

import { PageHeader } from '@/components/layout';
import { Button, Field, FormError, Input, PasswordInput } from '@/components/ui';
import { useApiForm } from '@/hooks';
import { paths, returnTo } from '@/lib';
import { SignInInput } from '@/types';

import { signIn } from '../api';

export function SignInPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { form, onSubmit, error, busy } = useApiForm({
    schema: SignInInput,
    defaultValues: { email: '', password: '' },
    submit: signIn,
    onSuccess: () => navigate(returnTo(params.get('from')), { replace: true }),
  });
  const { errors } = form.formState;

  return (
    <>
      <PageHeader title="Sign in" lede="Pick up where your team left off." />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormError message={error} />
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" spellCheck={false} {...form.register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <PasswordInput autoComplete="current-password" {...form.register('password')} />
        </Field>
        <Link to={paths.forgotPassword} className="self-start text-body-sm">
          Forgot password?
        </Link>
        <Button type="submit" variant="primary" size="lg" loading={busy} className="w-full">
          Sign in
        </Button>
      </form>
      <p className="text-body-sm text-text-2">
        New to VeraQA? <Link to={paths.register}>Create an account</Link>
      </p>
      {import.meta.env.DEV && (
        <p className="text-body-sm text-text-2">
          Development build: <Link to={paths.dev}>open dev tools</Link> to sign in as a demo person.
        </p>
      )}
    </>
  );
}
