import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { Button, Field, FormError, Input, PasswordInput } from '@/components/ui';
import { createQueryClient, request } from '@/lib';
import { mockServer, server } from '@/mocks/server';
import { RegisterInput, Session } from '@/types';

import { useApiForm } from './useApiForm';

mockServer();

function Register({ onDone }: { onDone: (session: Session) => void }) {
  const { form, onSubmit, error, busy } = useApiForm({
    schema: RegisterInput,
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
    submit: (values) => request('/auth/register', Session, { method: 'POST', body: values }),
    onSuccess: onDone,
  });
  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormError message={error} />
      <Field label="First name" error={errors.firstName?.message}>
        <Input {...form.register('firstName')} />
      </Field>
      <Field label="Last name" error={errors.lastName?.message}>
        <Input {...form.register('lastName')} />
      </Field>
      <Field label="Work email" error={errors.email?.message}>
        <Input type="email" {...form.register('email')} />
      </Field>
      <Field label="Password" error={errors.password?.message}>
        <PasswordInput {...form.register('password')} />
      </Field>
      <Button type="submit" loading={busy}>
        Create account
      </Button>
    </form>
  );
}

function setup() {
  const onDone = vi.fn();
  render(
    <QueryClientProvider client={createQueryClient()}>
      <Register onDone={onDone} />
    </QueryClientProvider>,
  );
  return { user: userEvent.setup(), onDone };
}

async function fill(user: ReturnType<typeof userEvent.setup>, email: string, password: string) {
  await user.type(screen.getByLabelText('First name'), 'Sami');
  await user.type(screen.getByLabelText('Last name'), 'Nour');
  await user.type(screen.getByLabelText('Work email'), email);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Create account' }));
}

describe('useApiForm', () => {
  it('checks the fields before sending and focuses the first wrong one', async () => {
    const { user, onDone } = setup();

    await fill(user, 'sami@shop', 'abc');

    expect(screen.getByLabelText('Work email')).toHaveAccessibleDescription(
      'Enter an email like name@company.com.',
    );
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'That password is too short. Use at least 8 characters, with a number.',
    );
    expect(screen.getByLabelText('Work email')).toHaveFocus();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('puts the server’s field errors on the matching inputs', async () => {
    const { user, onDone } = setup();

    await fill(user, 'lina.saeed@shop-team.com', 'Correct#456');

    expect(
      await screen.findByText('An account with this email already exists. Sign in instead.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Work email')).toHaveFocus();
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('shows a server message for a field the form doesn’t have above the form', async () => {
    server.use(
      http.post('*/api/auth/register', () =>
        HttpResponse.json(
          {
            error: {
              code: 'validation',
              message: 'Check the highlighted fields, then try again.',
              fields: { 'items.0': 'BUG-012 is past fixing, so it can’t be reassigned.' },
            },
          },
          { status: 422 },
        ),
      ),
    );
    const { user } = setup();

    await fill(user, 'sami.nour@shop-team.com', 'Correct#456');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'BUG-012 is past fixing, so it can’t be reassigned.',
    );
  });

  it('shows any other error once above the form', async () => {
    server.use(http.post('*/api/auth/register', () => Response.error()));
    const { user } = setup();

    await fill(user, 'sami.nour@shop-team.com', 'Correct#456');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'VeraQA couldn’t reach the server. Check your connection, then try again.',
    );
  });

  it('hands the answer on when it works', async () => {
    const { user, onDone } = setup();

    await fill(user, 'sami.nour@shop-team.com', 'Correct#456');

    await vi.waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect(onDone.mock.calls[0]?.[0]).toMatchObject({ user: { email: 'sami.nour@shop-team.com' } });
  });
});
