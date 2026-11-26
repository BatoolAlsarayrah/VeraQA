import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { queryClient, request } from '@/lib';
import { getFlags } from '@/mocks/api';
import { getDb } from '@/mocks/db';
import { mockServer } from '@/mocks/server';

import { Providers } from '../providers';
import { routes } from '../routes';

mockServer();

function visit(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return router;
}

describe('dev mock controls', () => {
  it('resets the demo data and signs Batool Hani back in, even from signed out', async () => {
    const user = userEvent.setup();
    const db = getDb();
    db.requirements = [];
    db.signedIn = null;
    const router = visit('/dev');

    await user.click(await screen.findByRole('button', { name: 'Reset demo data' }));
    const dialog = screen.getByRole('dialog', { name: 'Reset demo data?' });
    await user.click(within(dialog).getByRole('button', { name: 'Reset demo data' }));

    expect(await screen.findByRole('heading', { name: 'Your projects' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/projects');
    expect(getDb().signedIn).toBe('batool-hani');
    expect(getDb().requirements.length).toBeGreaterThan(0);
  });

  it('fails the next request once', async () => {
    const user = userEvent.setup();
    visit('/dev');
    const button = await screen.findByRole('button', { name: 'Fail the next request' });
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));

    await user.click(button);

    expect(screen.getByText('The next request will fail with a server error.')).toBeInTheDocument();
    expect(getFlags().failNext).toBe(true);
    await expect(request('/session', z.unknown())).rejects.toMatchObject({ status: 500 });
    await expect(request('/session', z.unknown())).resolves.toBeTruthy();
  });

  it('switches instant AI jobs and the slow network', async () => {
    const user = userEvent.setup();
    visit('/dev');

    await user.click(await screen.findByRole('switch', { name: /Instant AI jobs/ }));
    await user.click(screen.getByRole('switch', { name: /Slow network/ }));

    expect(getFlags()).toMatchObject({ instantJobs: false, slowNetwork: true });
  });
});
