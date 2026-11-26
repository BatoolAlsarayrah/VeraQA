import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { Providers } from '@/app/providers';
import { routes } from '@/app/routes';
import { getDb } from '@/mocks/db';
import { mockServer } from '@/mocks/server';

mockServer();

beforeEach(() => {
  getDb().signedIn = null;
});

function visit(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return { router, user: userEvent.setup() };
}

type User = ReturnType<typeof userEvent.setup>;

async function fill(user: User, values: { first?: string; email: string; password: string }) {
  if (values.first) await user.type(await screen.findByLabelText('First name'), values.first);
  await user.type(screen.getByLabelText('Last name'), 'Nour');
  await user.type(screen.getByLabelText('Work email'), values.email);
  await user.type(screen.getByLabelText('Password'), values.password);
  await user.click(screen.getByRole('button', { name: 'Create account' }));
}

describe('Register', () => {
  it('shows the password rules before anything goes wrong', async () => {
    visit('/register');

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(
      screen.getByText('It takes a minute. You can invite your team later.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'At least 8 characters, with a number.',
    );
    expect(screen.getByLabelText('Work email')).toHaveAttribute('placeholder', 'name@company.com');
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/signin');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('checks every field and focuses the first one to fix', async () => {
    const { user } = visit('/register');
    await screen.findByLabelText('First name');

    await fill(user, { email: 'batool@shop', password: 'abc' });

    expect(screen.getByLabelText('First name')).toHaveAccessibleDescription(
      'Enter your first name.',
    );
    expect(screen.getByLabelText('Work email')).toHaveAccessibleDescription(
      'Enter an email like name@company.com.',
    );
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'That password is too short. Use at least 8 characters, with a number.',
    );
    expect(screen.getByLabelText('First name')).toHaveFocus();
  });

  it('asks for a number in the password', async () => {
    const { user } = visit('/register');

    await fill(user, { first: 'Sami', email: 'sami.nour@shop-team.com', password: 'abcdefgh' });

    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'Add a number. Use at least 8 characters, with a number.',
    );
  });

  it('puts the server’s answer on the email field when the email is taken', async () => {
    const { user, router } = visit('/register');

    await fill(user, { first: 'Sami', email: 'lina.saeed@shop-team.com', password: 'Correct#456' });

    expect(
      await screen.findByText('An account with this email already exists. Sign in instead.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Work email')).toHaveFocus();
    expect(router.state.location.pathname).toBe('/register');
  });

  it('signs the new person in and opens Your projects', async () => {
    const { user, router } = visit('/register');

    await fill(user, { first: 'Sami', email: 'sami.nour@shop-team.com', password: 'Correct#456' });

    expect(await screen.findByRole('heading', { name: 'Your projects' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/projects');
    const person = getDb().people.find((entry) => entry.email === 'sami.nour@shop-team.com');
    expect(getDb().signedIn).toBe(person?.id);
  });
});
