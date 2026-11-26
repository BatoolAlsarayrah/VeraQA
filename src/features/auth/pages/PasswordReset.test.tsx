import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { Providers } from '@/app/providers';
import { routes } from '@/app/routes';
import { setFlags } from '@/mocks/api';
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

function newLink(email = 'lina.saeed@shop-team.com') {
  const token = crypto.randomUUID();
  getDb().resetLink = { email, token, createdAt: new Date().toISOString(), used: false };
  return `/reset-password/${token}`;
}

async function choose(user: ReturnType<typeof userEvent.setup>, password: string, confirm: string) {
  await user.type(await screen.findByLabelText('New password'), password);
  await user.type(screen.getByLabelText('Confirm password'), confirm);
  await user.click(screen.getByRole('button', { name: 'Save new password' }));
}

describe('Reset your password', () => {
  it('asks for an email, then says to check it', async () => {
    const { user, router } = visit('/forgot-password');

    await user.click(await screen.findByRole('button', { name: 'Send reset link' }));
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(
      'Enter an email like name@company.com.',
    );

    await user.type(screen.getByLabelText('Email'), 'lina.saeed@shop-team.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'If lina.saeed@shop-team.com has an account, a reset link is on its way. The link works for 1 hour.',
      ),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/forgot-password/sent');
    expect(getDb().resetLink?.email).toBe('lina.saeed@shop-team.com');
  });

  it('links back to sign in', async () => {
    visit('/forgot-password');

    expect(await screen.findByRole('link', { name: 'Back to sign in' })).toHaveAttribute(
      'href',
      '/signin',
    );
  });
});

describe('Check your email', () => {
  it('sends the link again with the same email', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: [
        { pathname: '/forgot-password/sent', state: { email: 'lina.saeed@shop-team.com' } },
      ],
    });
    render(
      <Providers>
        <RouterProvider router={router} />
      </Providers>,
    );
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Send it again' }));

    expect(await screen.findByText('Reset link sent again')).toBeInTheDocument();
    expect(getDb().resetLink?.email).toBe('lina.saeed@shop-team.com');
    expect(screen.getByRole('link', { name: 'Use a different email' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });

  it('goes back to the form when it doesn’t know the email', async () => {
    const { router } = visit('/forgot-password/sent');

    expect(await screen.findByRole('heading', { name: 'Reset your password' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/forgot-password');
  });

  it('opens the mock’s link directly in a mock-mode development build', async () => {
    const { user } = visit('/forgot-password');

    await user.type(await screen.findByLabelText('Email'), 'lina.saeed@shop-team.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(
      await screen.findByRole('link', { name: 'Open the link from the email' }),
    ).toHaveAttribute('href', `/reset-password/${getDb().resetLink?.token ?? ''}`);
  });
});

describe('Choose a new password', () => {
  it('checks the rules and the match, and focuses what to fix', async () => {
    const { user } = visit(newLink());

    await choose(user, 'abc', 'abc');
    expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
      'That password is too short. Use at least 8 characters, with a number.',
    );
    expect(screen.getByLabelText('New password')).toHaveFocus();

    await user.clear(screen.getByLabelText('New password'));
    await user.clear(screen.getByLabelText('Confirm password'));
    await choose(user, 'Fresh#2027', 'Fresh#2028');
    expect(screen.getByLabelText('Confirm password')).toHaveAccessibleDescription(
      'The two passwords don’t match. Type the new one again.',
    );
    expect(screen.getByLabelText('Confirm password')).toHaveFocus();
  });

  it('saves the password and sends the person to sign in', async () => {
    getDb().signedIn = 'lina-saeed';
    const { user } = visit(newLink());

    await choose(user, 'Fresh#2027', 'Fresh#2027');

    expect(await screen.findByRole('heading', { name: 'Password changed' })).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Password changed · VeraQA'));
    expect(
      screen.getByText('You’ve been signed out on other devices. Sign in with your new password.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to sign in' })).toHaveAttribute('href', '/signin');
    expect(getDb().people.find((person) => person.id === 'lina-saeed')?.password).toBe(
      'Fresh#2027',
    );
    expect(getDb().signedIn).toBeNull();
  });

  it('shows This link has expired straight away for a dead link', async () => {
    const { router } = visit('/reset-password/not-a-token');

    expect(
      await screen.findByRole('heading', { name: 'This link has expired' }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('New password')).toBeNull();
    await waitFor(() => expect(document.title).toBe('This link has expired · VeraQA'));
    expect(screen.getByRole('link', { name: 'Send a new link' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
    expect(screen.getByRole('link', { name: 'Back to sign in' })).toHaveAttribute(
      'href',
      '/signin',
    );
    expect(router.state.location.pathname).toBe('/reset-password/not-a-token');
  });

  it('shows the same when the link dies while the form is open', async () => {
    const { user } = visit(newLink());
    await screen.findByLabelText('New password');
    setFlags({ expiredLinks: true });

    await choose(user, 'Fresh#2027', 'Fresh#2027');

    expect(
      await screen.findByRole('heading', { name: 'This link has expired' }),
    ).toBeInTheDocument();
  });

  it('stays open for someone who is signed in', async () => {
    getDb().signedIn = 'batool-hani';
    const { router } = visit(newLink('batool.hani@shop-team.com'));

    expect(
      await screen.findByRole('heading', { name: 'Choose a new password' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toMatch(/^\/reset-password\//);
  });
});
