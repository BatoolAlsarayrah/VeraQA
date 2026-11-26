import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { notices, renderAt as renderIn } from '@/mocks/render';
import { mockServer, signIn } from '@/mocks/server';

import { PhoneHeader } from './PhoneHeader';

type Back = { label: string; to: string };

function renderAt(path: string, back?: Back) {
  renderIn(path, <PhoneHeader back={back} notices={notices(10, 7)} />);
}

mockServer();

beforeEach(async () => {
  await signIn();
});

describe('PhoneHeader', () => {
  it('shows the project as a link to switch projects', () => {
    renderAt('/projects/e-commerce-portal-v2/dashboard');

    expect(
      screen.getByRole('link', { name: 'Switch project, current project E-Commerce Portal v2' }),
    ).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: 'Search' })).toHaveAttribute('href', '/search');
  });

  it('shows a back link on deeper pages', () => {
    renderAt('/projects/e-commerce-portal-v2/runs/12', {
      label: 'Test runs',
      to: '/projects/e-commerce-portal-v2/runs',
    });

    expect(screen.getByRole('link', { name: 'Test runs' })).toHaveAttribute(
      'href',
      '/projects/e-commerce-portal-v2/runs',
    );
  });

  it('opens notifications as a sheet', async () => {
    const user = userEvent.setup();
    renderAt('/projects/e-commerce-portal-v2/dashboard');

    await user.click(screen.getByRole('button', { name: 'Notifications, 7 unread' }));

    const sheet = screen.getByRole('dialog', { name: 'Notifications' });
    expect(within(sheet).getByRole('link', { name: 'All activity' })).toBeInTheDocument();
  });

  it('keeps only the account button for a developer', async () => {
    const user = userEvent.setup();
    renderAt('/projects/payments-api/defects');

    expect(screen.queryByRole('link', { name: 'Search' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Notifications/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Account, Batool Hani' }));

    const sheet = screen.getByRole('dialog', { name: 'Account' });
    expect(within(sheet).getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });
});
