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

function visit(projectId = 'e-commerce-portal-v2') {
  render(
    <Providers>
      <RouterProvider
        router={createMemoryRouter(routes, { initialEntries: [`/projects/${projectId}/my-work`] })}
      />
    </Providers>,
  );
  return userEvent.setup();
}

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: 'Assign work' }));
  return screen.getByRole('dialog', { name: 'Assign work' });
}

const people = (dialog: HTMLElement) =>
  within(within(dialog).getByLabelText('Assign to'))
    .getAllByRole('option')
    .slice(1)
    .map((option) => option.textContent);

describe('Assign work', () => {
  it('is only offered to people who manage the project', async () => {
    visit('clinic-booking-app');

    expect(await screen.findByRole('heading', { name: 'My work' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Assign work' })).not.toBeInTheDocument();
  });

  it('offers only people who can do the picked work', async () => {
    const user = visit();
    const dialog = await open(user);

    await user.click(await within(dialog).findByRole('checkbox', { name: /REQ-015/ }));
    expect(people(dialog)).toEqual(['Maria Ayman', 'Batool Hani']);

    await user.click(within(dialog).getByRole('tab', { name: 'Defects' }));
    await user.click(await within(dialog).findByRole('checkbox', { name: /BUG-010/ }));
    expect(people(dialog)).toEqual(['Maria Ayman']);
    expect(within(dialog).getByRole('button', { name: 'Assign 2 items' })).toBeInTheDocument();
  });

  it('assigns the picked items with a due date, and says so', async () => {
    const user = visit();
    const dialog = await open(user);

    await user.click(within(dialog).getByRole('tab', { name: 'Test cases' }));
    await user.click(await within(dialog).findByRole('checkbox', { name: /TC-001/ }));
    await user.selectOptions(within(dialog).getByLabelText('Assign to'), 'batool-mahmoud');
    await user.type(within(dialog).getByLabelText(/Due date/), '2026-12-01');
    await user.click(within(dialog).getByRole('button', { name: 'Assign 1 item' }));

    expect(await screen.findByText('Assigned to Batool Mahmoud')).toBeInTheDocument();
    const testCase = getDb().testCases.find(
      (entry) => entry.projectId === 'e-commerce-portal-v2' && entry.id === 'TC-001',
    );
    expect(testCase).toMatchObject({ assigneeId: 'batool-mahmoud', due: '2026-12-01' });
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Assign work' })).not.toBeInTheDocument(),
    );
  });

  it('asks who gets the work', async () => {
    const user = visit();
    const dialog = await open(user);

    await user.click(await within(dialog).findByRole('checkbox', { name: /REQ-015/ }));
    await user.click(within(dialog).getByRole('button', { name: 'Assign 1 item' }));

    expect(within(dialog).getByLabelText('Assign to')).toHaveAccessibleDescription(
      'Choose who gets the work.',
    );
  });
});

describe('Ready to run again', () => {
  it('falls back to the whole test when the blocked step isn’t known', async () => {
    server.use(
      http.get('*/api/projects/:projectId/my-work', () =>
        HttpResponse.json({
          groups: [
            {
              kind: 'ready-to-run-again',
              items: [
                {
                  item: { type: 'test-case', id: 'TC-040', title: 'Pay with a valid Visa card' },
                  due: null,
                  run: { number: 12, name: 'Sprint 4 regression' },
                  assignedBy: null,
                  openFindings: null,
                  draftedFor: null,
                  blockedBy: { id: 'BUG-003', title: 'Card payment fails', status: 'closed' },
                  blockedStep: null,
                  fixedBy: null,
                  retest: null,
                },
              ],
            },
          ],
        }),
      ),
    );
    visit();

    expect(await screen.findByRole('region', { name: 'Ready to run again' })).toHaveTextContent(
      'BUG-003 is closed, so this test isn’t blocked any more.',
    );
  });
});
