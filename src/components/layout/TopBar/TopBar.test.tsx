import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { TopBar } from './TopBar';
import type { Stage } from './WorkflowStrip';

function renderAt(path: string, stage: Stage | undefined, crumb: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/projects/:projectId/*" element={<TopBar stage={stage} crumb={crumb} />} />
      </Routes>
    </MemoryRouter>,
  );
}

function popover(name: string) {
  const trigger = screen.getByRole('button', { name });
  const panel = document.getElementById(trigger.getAttribute('popovertarget') ?? '');
  if (!panel) throw new Error(`No popover for ${name}`);
  return panel;
}

describe('TopBar', () => {
  it('shows the workflow strip on a stage page with the current stage marked', () => {
    renderAt('/projects/e-commerce-portal-v2/requirements', 'requirements', 'Requirements');
    const strip = screen.getByRole('navigation', { name: 'Workflow' });

    expect(within(strip).getByRole('link', { name: 'Requirements' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(within(strip).getByRole('link', { name: 'SRS' })).toHaveAttribute(
      'href',
      '/projects/e-commerce-portal-v2/requirements/new',
    );
  });

  it('keeps SRS as plain text for someone who cannot add requirements', () => {
    renderAt('/projects/clinic-booking-app/test-cases', 'test-cases', 'Test cases');
    const strip = screen.getByRole('navigation', { name: 'Workflow' });

    expect(within(strip).queryByRole('link', { name: 'SRS' })).not.toBeInTheDocument();
    expect(within(strip).getByText('SRS')).toBeInTheDocument();
  });

  it('shows a breadcrumb elsewhere, and always for developers', () => {
    renderAt('/projects/payments-api/defects', 'defects', 'Your defects');
    const crumb = screen.getByRole('navigation', { name: 'Breadcrumb' });

    expect(within(crumb).getByRole('link', { name: 'Payments API' })).toHaveAttribute(
      'href',
      '/projects/payments-api/defects',
    );
    expect(within(crumb).getByText('Your defects')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('searchbox', { name: 'Search your defects' })).toHaveAttribute(
      'placeholder',
      'Search defects',
    );
  });

  it('counts unread notifications and offers All activity to managers', () => {
    renderAt('/projects/e-commerce-portal-v2/dashboard', undefined, 'Dashboard');
    const panel = popover('Notifications, 7 unread');

    expect(within(panel).getByRole('link', { name: 'All activity', hidden: true })).toHaveAttribute(
      'href',
      '/projects/e-commerce-portal-v2/activity',
    );
    expect(within(panel).getAllByRole('listitem', { hidden: true })).toHaveLength(6);
    expect(
      within(panel).getByRole('link', { name: 'See all notifications', hidden: true }),
    ).toHaveAttribute('href', '/notifications');
  });

  it('leaves All activity and Project settings out for a QA engineer', () => {
    renderAt('/projects/clinic-booking-app/dashboard', undefined, 'Dashboard');

    expect(
      within(popover('Notifications, 2 unread')).queryByRole('link', {
        name: 'All activity',
        hidden: true,
      }),
    ).not.toBeInTheDocument();
    const account = popover('Account, Batool Hani');
    expect(within(account).getByText('QA engineer in', { exact: false })).toBeInTheDocument();
    expect(
      within(account).queryByRole('link', { name: 'Project settings', hidden: true }),
    ).not.toBeInTheDocument();
    expect(within(account).getByRole('link', { name: 'Sign out', hidden: true })).toHaveAttribute(
      'href',
      '/signin',
    );
  });

  it('switches the theme', async () => {
    const user = userEvent.setup();
    renderAt('/projects/e-commerce-portal-v2/dashboard', undefined, 'Dashboard');

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });
});
