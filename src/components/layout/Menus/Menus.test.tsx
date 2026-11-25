import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import type { Notice } from '@/lib';

import { AccountCard } from './AccountCard';
import { AccountMenu } from './AccountMenu';
import { NotificationList } from './NotificationList';
import { NotificationsMenu } from './NotificationsMenu';

const user = { name: 'Batool Hani', email: 'batool.hani@shop-team.com' };

const notices: Notice[] = [
  {
    title: 'Qays Kaled marked BUG-007 as fixed',
    detail: 'Start the retest when you’re ready.',
    time: '5 minutes ago',
    to: '/projects/p/defects/BUG-007',
    unread: true,
  },
  { title: 'BUG-004 is ready for retest', time: 'Yesterday, 11:05', to: '/b', unread: false },
];

function inRouter(node: React.ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>);
}

describe('NotificationList', () => {
  it('links each notice to its item and marks the unread ones for screen readers', () => {
    inRouter(<NotificationList notices={notices} />);

    expect(
      screen.getByRole('link', { name: /Qays Kaled marked BUG-007 as fixed, unread/ }),
    ).toHaveAttribute('href', '/projects/p/defects/BUG-007');
    expect(
      screen.getByRole('link', { name: /BUG-004 is ready for retest/ }),
    ).not.toHaveAccessibleName(/unread/);
    expect(screen.getByRole('link', { name: 'See all notifications' })).toHaveAttribute(
      'href',
      '/notifications',
    );
  });

  it('shows All activity only when given a link for it', () => {
    const { rerender } = inRouter(<NotificationList notices={notices} />);
    expect(screen.queryByRole('link', { name: 'All activity' })).not.toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <NotificationList notices={notices} activity="/projects/p/activity" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'All activity' })).toHaveAttribute(
      'href',
      '/projects/p/activity',
    );
  });

  it('shows at most six notices', () => {
    const many = Array.from({ length: 9 }, (_, index) => ({
      title: `Notice ${index}`,
      time: 'Today',
      to: '/x',
      unread: false,
    }));
    inRouter(<NotificationList notices={many} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(6);
  });
});

describe('NotificationsMenu', () => {
  it('names the unread count on the bell, or just Notifications when all are read', () => {
    const { rerender } = inRouter(<NotificationsMenu notices={notices} />);
    expect(screen.getByRole('button', { name: 'Notifications, 1 unread' })).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <NotificationsMenu notices={notices.map((notice) => ({ ...notice, unread: false }))} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  });
});

describe('AccountCard', () => {
  it('shows the person, their role in the project and the project links', () => {
    inRouter(
      <AccountCard
        user={user}
        role={{ label: 'QA lead', project: 'E-Commerce Portal v2' }}
        settings="/projects/p/settings"
      />,
    );

    expect(screen.getByText('batool.hani@shop-team.com')).toBeInTheDocument();
    expect(screen.getByText('E-Commerce Portal v2')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Project settings' })).toHaveAttribute(
      'href',
      '/projects/p/settings',
    );
    expect(screen.getByRole('link', { name: 'Switch project' })).toHaveAttribute(
      'href',
      '/projects',
    );
  });

  it('keeps only Account settings and Sign out outside a project', () => {
    inRouter(<AccountCard user={user} solo />);
    const names = screen.getAllByRole('link').map((link) => link.textContent);

    expect(names).toEqual(['Account settings', 'Sign out']);
  });
});

describe('AccountMenu', () => {
  it('opens the account card from the avatar', () => {
    inRouter(<AccountMenu user={user} solo />);
    const trigger = screen.getByRole('button', { name: 'Account, Batool Hani' });
    const panel = document.getElementById(trigger.getAttribute('popovertarget') ?? '');
    if (!panel) throw new Error('No account popover');

    expect(within(panel).getByRole('link', { name: 'Sign out', hidden: true })).toHaveAttribute(
      'href',
      '/signin',
    );
  });
});
