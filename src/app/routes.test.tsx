import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';

import { Providers } from './providers';
import { routes } from './routes';

function visit(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return router;
}

describe('routes', () => {
  it('sends / to the projects list', async () => {
    const router = visit('/');

    expect(await screen.findByRole('heading', { name: 'Your projects' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/projects');
  });

  it('sends a project to its dashboard and titles the page', async () => {
    visit('/projects/e-commerce-portal-v2');

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(document.title).toBe('Dashboard · VeraQA');
  });

  it.each([
    ['/projects/p/requirements/REQ-014', 'REQ-014'],
    ['/projects/p/scenarios/SC-007', 'SC-007'],
    ['/projects/p/test-cases/TC-031', 'TC-031'],
    ['/projects/p/runs/12', 'Run 12'],
    ['/projects/p/runs/12/TC-031', 'Run a test · TC-031'],
    ['/projects/p/defects/BUG-007', 'BUG-007'],
    ['/projects/p/requirements/new', 'Add requirements'],
    ['/projects/p/scenarios/generate', 'Generating test scenarios'],
  ])('opens %s', async (path, heading) => {
    visit(path);

    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it('treats the project id as an opaque string', async () => {
    visit('/projects/Payments%20API/defects');

    expect(await screen.findByRole('heading', { name: 'Defects' })).toBeInTheDocument();
  });

  it.each([
    '/nowhere',
    '/projects/p/requirements/abc',
    '/projects/p/runs/twelve',
    '/projects/p/defects/BUG',
  ])('shows Not found for %s', async (path) => {
    visit(path);

    expect(
      await screen.findByRole('heading', { name: 'This stop isn’t on the line' }),
    ).toBeInTheDocument();
  });

  it('opens the component gallery in development', async () => {
    visit('/dev/components');

    expect(await screen.findByRole('heading', { name: 'Component gallery' })).toBeInTheDocument();
  });
});
