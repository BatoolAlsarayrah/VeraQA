import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { afterEach, describe, expect, it } from 'vitest';

import { keys, queryClient, sessionQuery } from '@/lib';
import { getDb } from '@/mocks/db';
import { mockServer } from '@/mocks/server';

import { Providers } from '../providers';
import { routes } from './routes';

const lead = '/projects/e-commerce-portal-v2';
const engineer = '/projects/clinic-booking-app';
const developer = '/projects/payments-api';
const manager = '/projects/library-system';

function visit(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return router;
}

mockServer();

afterEach(() => {
  sessionStorage.clear();
});

describe('routes', () => {
  it('sends / to the projects list', async () => {
    const router = visit('/');

    expect(await screen.findByRole('heading', { name: 'Your projects' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/projects');
  });

  it('frames each kind of page in its own layout', async () => {
    visit('/projects');
    expect(await screen.findByRole('link', { name: 'VeraQA, your projects' })).toBeInTheDocument();
  });

  it.each([
    ['/account', true],
    [`${lead}/requirements/new`, true],
    [`${lead}/settings`, true],
    [`${lead}/requirements`, false],
  ])('sets %s in the narrow column: %s', async (path, narrow) => {
    visit(path);
    const heading = await screen.findByRole('heading', { level: 1 });
    const column = screen.getByRole('main').firstElementChild;

    expect(column).toContainElement(heading);
    if (narrow) expect(column).toHaveClass('max-w-200');
    else expect(column).not.toHaveClass('max-w-200');
  });

  it('opens a project at its dashboard and titles the page', async () => {
    const router = visit(lead);

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`${lead}/dashboard`);
    expect(document.title).toBe('Dashboard · VeraQA');
  });

  it.each([
    [`${lead}/requirements/REQ-014`, 'REQ-014'],
    [`${lead}/scenarios/SC-007`, 'SC-007'],
    [`${lead}/test-cases/TC-031`, 'TC-031'],
    [`${lead}/runs/12`, 'Run 12'],
    [`${lead}/runs/12/TC-031`, 'Run a test · TC-031'],
    [`${lead}/defects/BUG-007`, 'BUG-007'],
    [`${lead}/requirements/new`, 'Add requirements'],
    [`${lead}/scenarios/generate`, 'Generating test scenarios'],
  ])('opens %s', async (path, heading) => {
    visit(path);

    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it.each(['/nowhere', `${lead}/requirements/abc`, `${lead}/runs/twelve`, `${lead}/defects/BUG`])(
    'shows Not found for %s',
    async (path) => {
      visit(path);

      expect(
        await screen.findByRole('heading', { name: 'This stop isn’t on the line' }),
      ).toBeInTheDocument();
      expect(document.title).toBe('Page not found · VeraQA');
    },
  );

  it('opens the component gallery in development', async () => {
    visit('/dev/components');

    expect(await screen.findByRole('heading', { name: 'Component gallery' })).toBeInTheDocument();
  });
});

describe('route guard', () => {
  it.each([
    ['a QA engineer opening Reports', `${engineer}/reports`, `${engineer}/dashboard`],
    ['a QA engineer adding requirements', `${engineer}/requirements/new`, `${engineer}/dashboard`],
    [
      'a QA engineer generating scenarios',
      `${engineer}/scenarios/generate`,
      `${engineer}/dashboard`,
    ],
    ['a developer opening Requirements', `${developer}/requirements`, `${developer}/defects`],
    ['a developer opening the dashboard', `${developer}/dashboard`, `${developer}/defects`],
    ['a developer opening a project', developer, `${developer}/defects`],
    ['anyone opening a project they are not in', '/projects/someone-else', '/projects'],
  ])('silently redirects %s', async (_, path, home) => {
    const router = visit(path);

    await waitFor(() => expect(router.state.location.pathname).toBe(home));
    expect(
      screen.queryByRole('heading', { name: 'This stop isn’t on the line' }),
    ).not.toBeInTheDocument();
  });

  it.each([
    ['a project manager', `${manager}/settings`, 'Project settings'],
    ['a QA lead', `${lead}/members`, 'Members'],
    ['a QA engineer', `${engineer}/traceability`, 'Traceability'],
    ['a developer', `${developer}/defects/BUG-007`, 'BUG-007'],
  ])('lets %s open what their capabilities allow', async (_, path, heading) => {
    const router = visit(path);

    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(path);
  });

  it('names the defects list for a developer', async () => {
    visit(`${developer}/defects`);

    expect(await screen.findByRole('heading', { name: 'Your defects' })).toBeInTheDocument();
    expect(document.title).toBe('Your defects · VeraQA');
  });

  it('reads capabilities, not the role name', async () => {
    const session = await queryClient.fetchQuery(sessionQuery);
    queryClient.setQueryData(keys.session, {
      ...session,
      memberships: session.memberships.map((entry) =>
        entry.projectId === 'payments-api' ? { ...entry, capabilities: ['fix', 'manage'] } : entry,
      ),
    });
    const router = visit(`${developer}/reports`);

    expect(await screen.findByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`${developer}/reports`);
  });

  it('sends someone who isn’t signed in to Sign in, with a way into the dev tools', async () => {
    getDb().signedIn = null;
    const router = visit(`${lead}/dashboard`);

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/signin');
    expect(screen.getByRole('link', { name: 'open dev tools' })).toHaveAttribute('href', '/dev');
  });

  it('keeps the dev tools open while signed out, so nobody gets locked out', async () => {
    getDb().signedIn = null;
    const router = visit('/dev');

    expect(await screen.findByRole('heading', { name: 'Dev tools' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in as Batool Hani' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/dev');
  });
});
