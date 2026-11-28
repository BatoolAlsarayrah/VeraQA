import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';

import { Providers } from '@/app/providers';
import { routes } from '@/app/routes';
import { getDb } from '@/mocks/db';
import { mockServer } from '@/mocks/server';

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

type User = ReturnType<typeof userEvent.setup>;

async function openDialog(user: User) {
  await user.click(await screen.findByRole('button', { name: 'Create project' }));
  return screen.getByRole('dialog', { name: 'Create project' });
}

const membershipOf = (projectId: string) =>
  getDb().memberships.find(
    (entry) => entry.projectId === projectId && entry.personId === 'batool-hani',
  );

describe('Create project', () => {
  it('needs a name and focuses the field', async () => {
    const { user } = visit();
    const dialog = await openDialog(user);

    await user.click(within(dialog).getByRole('button', { name: 'Create project' }));

    expect(within(dialog).getByLabelText('Project name')).toHaveAccessibleDescription(
      'Give the project a name.',
    );
    expect(within(dialog).getByLabelText('Project name')).toHaveFocus();
  });

  it('makes you project manager of a solo project and opens its dashboard', async () => {
    const { user, router } = visit();
    const dialog = await openDialog(user);

    expect(within(dialog).getByRole('radio', { name: 'Just me' })).toBeChecked();
    await user.type(within(dialog).getByLabelText('Project name'), 'Thesis tools');
    await user.type(within(dialog).getByLabelText(/Description/), 'Tools for the thesis lab');
    await user.click(within(dialog).getByRole('button', { name: 'Create project' }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/projects/thesis-tools/dashboard'),
    );
    expect(membershipOf('thesis-tools')?.role).toBe('project-manager');
    expect(getDb().projects.find((project) => project.id === 'thesis-tools')?.solo).toBe(true);
  });

  it('offers Invite people for a team project, then opens its dashboard', async () => {
    const { user, router } = visit();
    const create = await openDialog(user);

    await user.type(within(create).getByLabelText('Project name'), 'Clinic portal');
    await user.click(within(create).getByRole('radio', { name: 'A team' }));
    await user.click(within(create).getByRole('button', { name: 'Create project' }));

    const dialog = await screen.findByRole('dialog', { name: 'Invite people' });
    await user.type(within(dialog).getByLabelText('Email addresses'), 'sami@shop, x');
    await user.click(within(dialog).getByRole('button', { name: 'Send invites' }));
    expect(within(dialog).getByLabelText('Email addresses')).toHaveAccessibleDescription(
      'Enter one or more email addresses, like name@company.com, separated by commas.',
    );

    await user.clear(within(dialog).getByLabelText('Email addresses'));
    await user.type(
      within(dialog).getByLabelText('Email addresses'),
      'sami.odeh@shop-team.com, rana.f@shop-team.com',
    );
    await user.selectOptions(within(dialog).getByLabelText('Role'), 'developer');
    expect(within(dialog).getByLabelText('Role')).toHaveAccessibleDescription(
      'Developers fix the defects assigned to them, and see only those defects.',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Send invites' }));

    expect(await screen.findByText('Invites sent to 2 people')).toBeInTheDocument();
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/projects/clinic-portal/dashboard'),
    );
    const sent = getDb().invitations.filter((entry) => entry.projectId === 'clinic-portal');
    expect(sent.map((entry) => [entry.email, entry.role])).toEqual([
      ['sami.odeh@shop-team.com', 'developer'],
      ['rana.f@shop-team.com', 'developer'],
    ]);
  });

  it('lets you skip inviting for now', async () => {
    const { user, router } = visit();
    const create = await openDialog(user);

    await user.type(within(create).getByLabelText('Project name'), 'Clinic portal');
    await user.click(within(create).getByRole('radio', { name: 'A team' }));
    await user.click(within(create).getByRole('button', { name: 'Create project' }));
    const dialog = await screen.findByRole('dialog', { name: 'Invite people' });
    await user.click(within(dialog).getByRole('button', { name: 'Skip for now' }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/projects/clinic-portal/dashboard'),
    );
    expect(getDb().invitations.some((entry) => entry.projectId === 'clinic-portal')).toBe(false);
  });

  it('closes without creating anything on Cancel', async () => {
    const { user } = visit();
    const dialog = await openDialog(user);
    const before = getDb().projects.length;

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog', { name: 'Create project' })).not.toBeInTheDocument();
    expect(getDb().projects).toHaveLength(before);
  });

  it('starts from the empty state too', async () => {
    const db = getDb();
    db.memberships = db.memberships.filter((entry) => entry.personId !== 'batool-hani');
    db.invitations = [];
    const { user } = visit();

    await screen.findByText('No projects yet');
    const buttons = screen.getAllByRole('button', { name: 'Create project' });
    await user.click(buttons[buttons.length - 1] as HTMLElement);

    expect(screen.getByRole('dialog', { name: 'Create project' })).toBeInTheDocument();
  });
});
