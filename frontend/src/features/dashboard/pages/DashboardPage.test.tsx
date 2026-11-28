import { render, screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';

import { Providers } from '@/app/providers';
import { routes } from '@/app/routes';
import { getDb } from '@/mocks/db';
import { mockServer, server } from '@/mocks/server';

mockServer();

function visit(projectId: string) {
  render(
    <Providers>
      <RouterProvider
        router={createMemoryRouter(routes, {
          initialEntries: [`/projects/${projectId}/dashboard`],
        })}
      />
    </Providers>,
  );
}

const stages = async () =>
  within(await screen.findByRole('list', { name: 'Stages' }))
    .getAllByRole('link')
    .map((link) => link.textContent);

describe('Dashboard', () => {
  it('shows a QA lead every stage, the target date and the next decision', async () => {
    visit('e-commerce-portal-v2');

    expect(
      await screen.findByRole('heading', { name: 'E-Commerce Portal v2' }),
    ).toBeInTheDocument();
    expect(await stages()).toEqual([
      'SRS22 files analyzed',
      'Requirements2621 approved, 5 pending review',
      'Test scenarios1311 approved, 2 pending review',
      'Test cases3534 approved, 1 pending review',
      'Test runs22/34test cases run in Run 12',
      'Defects7open, 1 critical',
    ]);
    expect(
      screen.getByText(/^You’re a QA lead on this project\. Target date \d+ \w+\.$/),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Review 5 requirements' })).toHaveAttribute(
      'href',
      '/projects/e-commerce-portal-v2/requirements',
    );
  });

  it('lists what needs attention, with a link for each', async () => {
    visit('e-commerce-portal-v2');

    const panel = await screen.findByRole('region', { name: 'Needs your attention' });
    const rows = within(panel).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent(
      'Pending review5 requirements are waiting for your decisionReview',
    );
    const blocked = rows.find((row) => row.textContent.includes('TC-040'));
    expect(blocked).toHaveTextContent('TC-040 is blocked by BUG-003: Pay with a valid Visa card');
    expect(within(blocked as HTMLElement).getByRole('link', { name: 'Open run' })).toHaveAttribute(
      'href',
      '/projects/e-commerce-portal-v2/runs/12',
    );
    const retest = rows.find((row) => row.textContent.includes('BUG-005'));
    expect(within(retest as HTMLElement).getByRole('link', { name: 'Retest' })).toHaveAttribute(
      'href',
      '/projects/e-commerce-portal-v2/defects/BUG-005',
    );
  });

  it('gives the charts text alternatives', async () => {
    visit('e-commerce-portal-v2');

    expect(
      await screen.findByRole('table', { name: 'Test results in Run 12 · Sprint 4 regression' }),
    ).toHaveTextContent('Passed18Failed3Blocked1Not run12');
    expect(screen.getByRole('table', { name: 'Open defects by severity' })).toHaveTextContent(
      'Critical1High3Medium2Low1',
    );
  });

  it('shows recent activity in plain sentences', async () => {
    visit('e-commerce-portal-v2');

    const panel = await screen.findByRole('region', { name: 'Recent activity' });
    expect(within(panel).getAllByRole('listitem')[0]).toHaveTextContent(
      /^Qays Kaled marked BUG-007 as fixed/,
    );
  });

  it('gives a QA engineer five stages and their tests to run', async () => {
    visit('clinic-booking-app');

    expect((await stages()).map((stop) => stop.split(/\d/)[0])).toEqual([
      'Requirements',
      'Test scenarios',
      'Test cases',
      'Test runs',
      'Defects',
    ]);
    expect(screen.getByRole('link', { name: 'Run 3 test cases' })).toHaveAttribute(
      'href',
      '/projects/clinic-booking-app/my-work',
    );
    expect(screen.getByRole('region', { name: 'Needs your attention' })).toHaveTextContent(
      'TC-009 can run again now that BUG-003 is closed: Show the clinic’s phone number when refusing',
    );
  });

  it('names the project manager and leaves out a target date that isn’t set', async () => {
    visit('library-system');

    expect(
      await screen.findByText('You’re the project manager of this project.'),
    ).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Review 1 requirement' })).toBeInTheDocument();
    expect(await stages()).toContain('SRS0No SRS yet');
  });

  it('says what to do in a project with nothing in it yet', async () => {
    const db = getDb();
    db.memberships.push({
      projectId: 'mobile-banking-app',
      personId: 'batool-hani',
      role: 'qa-lead',
    });
    visit('mobile-banking-app');

    expect(await screen.findByText('Nothing to show yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add requirements' })).toHaveAttribute(
      'href',
      '/projects/mobile-banking-app/requirements/new',
    );
    expect(screen.queryByRole('list', { name: 'Stages' })).not.toBeInTheDocument();
  });

  it('offers to try again when the dashboard can’t load', async () => {
    server.use(
      http.get('*/api/projects/:projectId/dashboard', () =>
        HttpResponse.json({ error: { code: 'not_found', message: 'Gone.' } }, { status: 409 }),
      ),
    );
    visit('e-commerce-portal-v2');

    expect(
      await screen.findByText(
        'The dashboard couldn’t load. Check your connection, then try again.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
