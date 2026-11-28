import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';

import { Providers } from '@/app/providers';
import { routes } from '@/app/routes';
import { setCurrentProject } from '@/lib';
import { getDb } from '@/mocks/db';
import { mockServer } from '@/mocks/server';

mockServer();

function visit(projectId = 'e-commerce-portal-v2') {
  setCurrentProject(projectId);
  const router = createMemoryRouter(routes, { initialEntries: ['/notifications'] });
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return { router, user: userEvent.setup() };
}

const unreadInDb = () =>
  getDb().notifications.filter(
    (entry) =>
      entry.personId === 'batool-hani' &&
      entry.projectId === 'e-commerce-portal-v2' &&
      entry.unread,
  ).length;

describe('Notifications', () => {
  it('groups notifications by day, newest first, and marks the unread ones', async () => {
    visit();

    const today = await screen.findByRole('region', { name: 'Today' });
    const first = within(today).getAllByRole('link')[0] as HTMLElement;
    expect(first).toHaveTextContent('Qays Kaled marked BUG-007 as fixed Unread');
    expect(first).toHaveAttribute('href', '/projects/e-commerce-portal-v2/defects/BUG-007');
    expect(screen.getAllByRole('region').map((group) => group.getAttribute('aria-label'))).toEqual([
      'Today',
      'Yesterday',
      'Earlier this week',
    ]);
  });

  it('shows only unread notifications on the Unread tab', async () => {
    const { user } = visit();

    await user.click(await screen.findByRole('tab', { name: `Unread ${String(unreadInDb())}` }));

    const rows = screen.getAllByRole('link').filter((link) => link.closest('section'));
    expect(rows).toHaveLength(unreadInDb());
    expect(rows.every((row) => row.textContent.includes('Unread'))).toBe(true);
  });

  it('marks a notification read when it’s opened, and goes to it', async () => {
    const { user, router } = visit();

    const today = await screen.findByRole('region', { name: 'Today' });
    const before = unreadInDb();
    await user.click(within(today).getAllByRole('link')[0] as HTMLElement);

    await waitFor(() => expect(unreadInDb()).toBe(before - 1));
    expect(router.state.location.pathname).toBe('/projects/e-commerce-portal-v2/defects/BUG-007');
  });

  it('marks everything read at once', async () => {
    const { user } = visit();

    await user.click(await screen.findByRole('button', { name: 'Mark all as read' }));

    expect(await screen.findByText('All marked as read')).toBeInTheDocument();
    expect(unreadInDb()).toBe(0);
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Mark all as read' })).not.toBeInTheDocument(),
    );
  });

  it('says so when there’s nothing, and links to account settings', async () => {
    getDb().notifications = [];
    visit();

    expect(await screen.findByText('You’re all caught up')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'account settings' })).toHaveAttribute(
      'href',
      '/account',
    );
  });

  it('shows a developer the notifications about their own defects', async () => {
    visit('payments-api');

    const today = await screen.findByRole('region', { name: 'Today' });
    expect(
      within(today)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/projects/payments-api/defects/BUG-006', '/projects/payments-api/defects/BUG-003']);
    expect(screen.getByRole('region', { name: 'Yesterday' })).toHaveTextContent(
      'Batool Mahmoud assigned you BUG-005',
    );
  });
});
