import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';

import { ContractError, HttpError, NetworkError } from '@/lib';

import { Providers } from '../providers';
import { RouteError } from './RouteError';

function failWith(error: Error) {
  const router = createMemoryRouter([
    {
      path: '/',
      ErrorBoundary: RouteError,
      loader: () => {
        throw error;
      },
      Component: () => null,
    },
  ]);
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
}

describe('RouteError', () => {
  it('names the endpoint and field when the server breaks the contract', async () => {
    failWith(
      new ContractError('GET /api/projects/p/requirements', 'items.3.status', 'Invalid option'),
    );

    expect(
      await screen.findByRole('heading', { name: 'This page got data it can’t show' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('GET /api/projects/p/requirements · items.3.status'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument();
  });

  it('says plainly when the server can’t be reached', async () => {
    failWith(new NetworkError());

    expect(
      await screen.findByRole('heading', { name: 'VeraQA can’t reach the server' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('VeraQA couldn’t reach the server. Check your connection, then try again.'),
    ).toBeInTheDocument();
  });

  it('shows the server’s own message for other API errors', async () => {
    failWith(
      new HttpError(500, 'unknown', 'Something went wrong on the server. Try again in a moment.'),
    );

    expect(
      await screen.findByText('Something went wrong on the server. Try again in a moment.'),
    ).toBeInTheDocument();
  });

  it('shows Not found when the API says the item doesn’t exist', async () => {
    failWith(new HttpError(404, 'not_found', 'That item doesn’t exist anymore.'));

    expect(
      await screen.findByRole('heading', { name: 'This stop isn’t on the line' }),
    ).toBeInTheDocument();
  });
});
