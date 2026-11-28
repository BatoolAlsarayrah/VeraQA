import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';

import { getDb } from '@/mocks/db';
import { mockServer } from '@/mocks/server';

import { Providers } from '../providers';
import { routes } from './routes';

mockServer();

function visit(path: string) {
  render(
    <Providers>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
    </Providers>,
  );
}

const links = () =>
  screen.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')]);

describe('Page not found', () => {
  it('explains what happened, with no app header', async () => {
    visit('/nowhere');

    expect(
      await screen.findByRole('heading', { name: 'This stop isn’t on the line' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'The link may be old, or the item it pointed to was deleted. If someone sent it to you, ask them for a new one.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Page not found · VeraQA'));
  });

  it('goes back to the project’s dashboard or to Your projects', async () => {
    visit('/projects/e-commerce-portal-v2/requirements/abc');

    expect(await screen.findByRole('link', { name: 'Go to dashboard' })).toBeInTheDocument();
    expect(links()).toEqual([
      ['Go to dashboard', '/projects/e-commerce-portal-v2/dashboard'],
      ['Your projects', '/projects'],
    ]);
  });

  it('sends a developer back to their defects', async () => {
    visit('/projects/payments-api/defects/abc');

    expect(await screen.findByRole('link', { name: 'Go to your defects' })).toHaveAttribute(
      'href',
      '/projects/payments-api/defects',
    );
  });

  it('offers only Your projects outside a project', async () => {
    visit('/nowhere');

    expect(await screen.findByRole('link', { name: 'Your projects' })).toBeInTheDocument();
    expect(links()).toEqual([['Your projects', '/projects']]);
  });

  it('offers Sign in to someone who isn’t signed in', async () => {
    getDb().signedIn = null;
    visit('/nowhere');

    expect(await screen.findByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/signin');
    expect(links()).toEqual([['Sign in', '/signin']]);
  });
});
