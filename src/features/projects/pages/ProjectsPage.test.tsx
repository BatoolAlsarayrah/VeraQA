import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';

import { Providers } from '@/app/providers';
import { routes } from '@/app/routes';
import { getDb } from '@/mocks/db';
import { mockServer, server } from '@/mocks/server';

mockServer();

function visit() {
  const router = createMemoryRouter(routes, { initialEntries: ['/projects'] });
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return { router, user: userEvent.setup() };
}

describe('Your projects', () => {
  it('lists each project with your role and its stage', async () => {
    visit();

    const list = await screen.findByRole('list', { name: 'Projects' });
    const rows = within(list).getAllByRole('link');
    expect(rows.map((row) => row.querySelector('.text-title')?.textContent)).toEqual([
      'E-Commerce Portal v2',
      'Clinic booking app',
      'Payments API',
      'Library system',
    ]);
    expect(rows[0]).toHaveTextContent('QA lead');
    expect(rows[0]).toHaveTextContent('Reviewing requirements');
    expect(rows[2]).toHaveTextContent('Developer');
  });

  it('opens each project at its home for your role there', async () => {
    visit();

    const list = await screen.findByRole('list', { name: 'Projects' });
    const href = (name: string) =>
      within(list)
        .getAllByRole('link')
        .find((row) => row.textContent.includes(name))
        ?.getAttribute('href');
    expect(href('E-Commerce Portal v2')).toBe('/projects/e-commerce-portal-v2/dashboard');
    expect(href('Payments API')).toBe('/projects/payments-api/defects');
  });

  it('shows a pending invitation above the list', async () => {
    visit();

    const card = await screen.findByRole('region', { name: 'Invitation to Mobile banking app' });
    expect(card).toHaveTextContent('Lina Saeed invited you to Mobile banking app');
    expect(card).toHaveTextContent('You’d join as a QA engineer.');
  });

  it('opens the project when you accept', async () => {
    const { user, router } = visit();

    const card = await screen.findByRole('region', { name: 'Invitation to Mobile banking app' });
    await user.click(within(card).getByRole('button', { name: 'Accept' }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/projects/mobile-banking-app/dashboard'),
    );
    expect(
      getDb().memberships.some(
        (entry) => entry.projectId === 'mobile-banking-app' && entry.personId === 'batool-hani',
      ),
    ).toBe(true);
  });

  it('drops the card and says so when you decline', async () => {
    const { user } = visit();

    const card = await screen.findByRole('region', { name: 'Invitation to Mobile banking app' });
    await user.click(within(card).getByRole('button', { name: 'Decline' }));

    expect(await screen.findByText('Invitation declined')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /Invitation to/ })).not.toBeInTheDocument();
    expect(getDb().invitations.some((entry) => entry.id === 'inv-mobile-banking')).toBe(false);
  });

  it('says what to do when there are no projects yet', async () => {
    const db = getDb();
    db.memberships = db.memberships.filter((entry) => entry.personId !== 'batool-hani');
    db.invitations = [];
    visit();

    expect(await screen.findByText('No projects yet')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Create a project to start testing, or ask a project manager to invite you to theirs.',
      ),
    ).toBeInTheDocument();
  });

  it('offers to try again when the list can’t load', async () => {
    server.use(
      http.get('*/api/projects', () =>
        HttpResponse.json(
          { error: { code: 'server_error', message: 'Something went wrong.' } },
          { status: 500 },
        ),
      ),
    );
    const { user } = visit();

    expect(
      await screen.findByText(
        'Your projects couldn’t load. Check your connection, then try again.',
      ),
    ).toBeInTheDocument();
    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('list', { name: 'Projects' })).toBeInTheDocument();
  });
});
