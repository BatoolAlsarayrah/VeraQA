import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { RAIL_KEY, useCollapsedRail } from '@/hooks';
import { mockServer, signIn } from '@/mocks/server';
import { counts, renderAt as renderIn } from '@/test/render';

import { Sidebar } from './Sidebar';

function setWidth(desktop: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: desktop && query.includes('68.8125rem'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
}

function Shell() {
  const { collapsed, toggle } = useCollapsedRail();
  return <Sidebar collapsed={collapsed} onToggle={toggle} counts={counts} />;
}

function renderAt(path: string) {
  renderIn(path, <Shell />);
  return screen.getByRole('navigation', { name: 'Main' });
}

mockServer();

beforeEach(async () => {
  await signIn();
});
beforeEach(() => setWidth(true));
afterEach(() => Reflect.deleteProperty(window, 'matchMedia'));

describe('Sidebar', () => {
  it('shows a QA lead every group, with counts in the link names', () => {
    const nav = renderAt('/projects/e-commerce-portal-v2/dashboard');

    for (const name of [
      'Dashboard',
      'Test scenarios',
      'Traceability',
      'Reports',
      'Project settings',
    ]) {
      expect(within(nav).getByRole('link', { name })).toBeInTheDocument();
    }
    expect(within(nav).getByRole('link', { name: 'My work 6' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Requirements 5' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Defects 7' })).toBeInTheDocument();
  });

  it('marks the current page, including its detail pages', () => {
    const nav = renderAt('/projects/e-commerce-portal-v2/requirements/REQ-014');

    expect(within(nav).getByRole('link', { name: 'Requirements 5' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('leaves out what a QA engineer cannot use', () => {
    const nav = renderAt('/projects/clinic-booking-app/dashboard');

    expect(within(nav).getByRole('link', { name: 'Requirements' })).toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Reports' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Project settings' })).not.toBeInTheDocument();
  });

  it('gives a developer only their defects', () => {
    const nav = renderAt('/projects/payments-api/defects');

    expect(within(nav).getAllByRole('link')).toHaveLength(1);
    expect(within(nav).getByRole('link', { name: 'Your defects' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('links the project switcher and the person', () => {
    renderAt('/projects/e-commerce-portal-v2/dashboard');

    expect(
      screen.getByRole('link', { name: 'Switch project, current project E-Commerce Portal v2' }),
    ).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: 'Batool Hani QA lead' })).toHaveAttribute(
      'href',
      '/account',
    );
  });

  it('collapses to the icon rail and remembers it', async () => {
    const user = userEvent.setup();
    renderAt('/projects/e-commerce-portal-v2/dashboard');

    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));

    expect(localStorage.getItem(RAIL_KEY)).toBe('collapsed');
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByText('Project')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Defects 7' })).toBeInTheDocument();
  });

  it('starts collapsed when the browser remembers it', () => {
    localStorage.setItem(RAIL_KEY, 'collapsed');
    renderAt('/projects/e-commerce-portal-v2/dashboard');

    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  });

  it('shows the fixed icon rail with no collapse control between 901 and 1100px', () => {
    setWidth(false);
    renderAt('/projects/e-commerce-portal-v2/dashboard');

    expect(screen.queryByRole('button', { name: /sidebar/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
  });
});
