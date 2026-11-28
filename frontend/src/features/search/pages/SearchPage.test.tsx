import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';

import { Providers } from '@/app/providers';
import { routes } from '@/app/routes';
import { setCurrentProject } from '@/lib';
import { mockServer } from '@/mocks/server';

mockServer();

function visit(path: string, projectId = 'e-commerce-portal-v2') {
  setCurrentProject(projectId);
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return { router, user: userEvent.setup() };
}

const ids = () =>
  within(screen.getByRole('list', { name: 'Results' }))
    .getAllByRole('link')
    .map((link) => link.textContent.slice(0, 7));

describe('Search', () => {
  it('searches as you type and keeps the query in the address', async () => {
    const { user, router } = visit('/search');

    await user.type(await screen.findByLabelText('Search for'), 'lock');

    expect(await screen.findByText('8 results for “lock”')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?q=lock');
    expect(screen.getAllByText('Lock', { selector: 'mark' }).length).toBeGreaterThan(0);
    expect(
      within(screen.getByRole('list', { name: 'Results' })).getAllByRole('link')[0],
    ).toHaveAttribute('href', '/projects/e-commerce-portal-v2/requirements/REQ-014');
  });

  it('starts from the filters in the address, so a search can be shared', async () => {
    visit('/search?q=lock&type=defect');

    expect(await screen.findByText('1 result for “lock”')).toBeInTheDocument();
    expect(screen.getByLabelText('Search for')).toHaveValue('lock');
    expect(screen.getByLabelText('Type')).toHaveValue('defect');
    expect(ids()).toEqual(['BUG-007']);
  });

  it('offers only the statuses that fit the type, and drops one that no longer fits', async () => {
    const { user, router } = visit('/search?status=approved');

    await screen.findByText(/results$/);
    await user.selectOptions(screen.getByLabelText('Type'), 'defect');

    await waitFor(() =>
      expect(
        within(screen.getByLabelText('Status'))
          .getAllByRole('option')
          .map((option) => option.textContent),
      ).toEqual(['Any', 'Open', 'In progress', 'Fixed', 'Retest', 'Reopened', 'Closed', 'Invalid']),
    );
    await waitFor(() => expect(router.state.location.search).toBe('?type=defect'));
  });

  it('says when nothing matches', async () => {
    visit('/search?q=zzzz');

    expect(await screen.findByText('No results for “zzzz”')).toBeInTheDocument();
    expect(
      screen.getByText('Check the spelling, or try an ID such as TC-031.'),
    ).toBeInTheDocument();
  });

  it('lets a developer search only their own defects, without filters', async () => {
    visit('/search?q=refund', 'payments-api');

    const main = await screen.findByRole('main');
    expect(await within(main).findByLabelText('Search your defects')).toHaveValue('refund');
    expect(await screen.findByText('1 result for “refund”')).toBeInTheDocument();
    expect(ids()).toEqual(['BUG-003']);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});
