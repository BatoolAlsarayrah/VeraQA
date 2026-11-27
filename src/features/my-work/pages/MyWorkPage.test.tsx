import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';

import { Providers } from '@/app/providers';
import { routes } from '@/app/routes';
import { getDb } from '@/mocks/db';
import { mockServer } from '@/mocks/server';

mockServer();

function visit(projectId: string) {
  render(
    <Providers>
      <RouterProvider
        router={createMemoryRouter(routes, { initialEntries: [`/projects/${projectId}/my-work`] })}
      />
    </Providers>,
  );
}

const groups = async () =>
  (await screen.findAllByRole('region')).map((group) => group.getAttribute('aria-label'));

describe('My work', () => {
  it('groups a QA lead’s work, with a count for the page and each group', async () => {
    visit('e-commerce-portal-v2');

    expect(await groups()).toEqual([
      'Requirements pending review',
      'AI drafts to approve',
      'Tests to run',
      'Retests',
    ]);
    expect(screen.getByText('9 items need you, oldest due date first.')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Requirements pending review 3' }),
    ).toBeInTheDocument();
  });

  it('says what each item is waiting on and links to it', async () => {
    visit('e-commerce-portal-v2');

    const review = await screen.findByRole('region', { name: 'Requirements pending review' });
    const first = within(review).getAllByRole('listitem')[0] as HTMLElement;
    expect(first).toHaveTextContent(
      'REQ-015Reset the password at any timeAI flagged 3 issuesDue today',
    );
    expect(within(first).getByRole('link', { name: 'Review REQ-015' })).toHaveAttribute(
      'href',
      '/projects/e-commerce-portal-v2/requirements/REQ-015',
    );

    const drafts = screen.getByRole('region', { name: 'AI drafts to approve' });
    expect(drafts).toHaveTextContent('AI drafted this scenario for REQ-014');

    const tests = screen.getByRole('region', { name: 'Tests to run' });
    expect(within(tests).getByRole('link', { name: 'Run test TC-032' })).toHaveAttribute(
      'href',
      '/projects/e-commerce-portal-v2/runs/12/TC-032',
    );
  });

  it('puts tests that are ready to run again first, naming the closed defect', async () => {
    visit('clinic-booking-app');

    expect((await groups())[0]).toBe('Ready to run again');
    const ready = screen.getByRole('region', { name: 'Ready to run again' });
    expect(ready).toHaveTextContent(
      'TC-009Show the clinic’s phone number when refusingBUG-003 is closed, so this test isn’t blocked any more.',
    );
    expect(screen.getByRole('region', { name: 'Retests' })).toHaveTextContent(
      'Qays Kaled fixed it. Run TC-006 again.',
    );
  });

  it('says so when nothing is assigned', async () => {
    getDb().memberships.push({
      projectId: 'mobile-banking-app',
      personId: 'batool-hani',
      role: 'qa-engineer',
    });
    visit('mobile-banking-app');

    expect(await screen.findByText('You’re all caught up')).toBeInTheDocument();
    expect(screen.getByText('Nothing is assigned to you right now.')).toBeInTheDocument();
  });
});
