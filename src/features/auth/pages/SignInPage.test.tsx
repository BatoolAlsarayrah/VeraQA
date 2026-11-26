import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { Providers } from '@/app/providers';
import { routes } from '@/app/routes';
import { getDb } from '@/mocks/db';
import { DEMO_PASSWORD } from '@/mocks/seed/people';
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

async function signIn(user: ReturnType<typeof userEvent.setup>, email: string, password: string) {
  await user.type(await screen.findByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('Sign in', () => {
  it('shows the form with its links', async () => {
    visit('/signin');

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText('Pick up where your team left off.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('asks for both fields and focuses the first one missing', async () => {
    const { user } = visit('/signin');

    await user.click(await screen.findByRole('button', { name: 'Sign in' }));

    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(
      'Enter an email like name@company.com.',
    );
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Enter your password.');
    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  it('says once, above the form, when the details are wrong', async () => {
    const { user, router } = visit('/signin');

    await signIn(user, 'batool.hani@shop-team.com', 'Wrong#1234');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That email and password don’t match. Check them, or reset your password.',
    );
    expect(router.state.location.pathname).toBe('/signin');
    expect(getDb().signedIn).toBeNull();
  });

  it('opens Your projects after signing in', async () => {
    const { user, router } = visit('/signin');

    await signIn(user, 'batool.hani@shop-team.com', DEMO_PASSWORD);

    expect(await screen.findByRole('heading', { name: 'Your projects' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/projects');
    expect(getDb().signedIn).toBe('batool-hani');
  });

  it('goes back to the page that asked for sign-in', async () => {
    const { user, router } = visit('/projects/payments-api/defects');

    await signIn(user, 'batool.hani@shop-team.com', DEMO_PASSWORD);

    expect(await screen.findByRole('heading', { name: 'Your defects' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/projects/payments-api/defects');
  });

  it('ignores a "from" that leaves the site', async () => {
    const { user, router } = visit('/signin?from=%2F%2Fexample.com');

    await signIn(user, 'batool.hani@shop-team.com', DEMO_PASSWORD);

    expect(await screen.findByRole('heading', { name: 'Your projects' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/projects');
  });

  it('skips the form for someone already signed in', async () => {
    getDb().signedIn = 'batool-hani';
    const { router } = visit('/signin');

    expect(await screen.findByRole('heading', { name: 'Your projects' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/projects');
  });
});
