import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { queryClient } from '@/lib';
import { getDb } from '@/mocks/db';
import { mockServer } from '@/mocks/server';

import { AccountCard } from './AccountCard';
import { AccountMenu } from './AccountMenu';
import { type Notice, NotificationList } from './NotificationList';
import { NotificationsMenu } from './NotificationsMenu';

const user = { id: 'batool-hani', name: 'Batool Hani', email: 'batool.hani@shop-team.com' };

const notices: Notice[] = [
  {
    id: 'note-1',
    title: 'Qays Kaled marked BUG-007 as fixed',
    detail: 'Start the retest when you’re ready.',
    time: '5 minutes ago',
    to: '/projects/p/defects/BUG-007',
    unread: true,
  },
  {
    id: 'note-2',
    title: 'BUG-004 is ready for retest',
    time: 'Yesterday, 11:05',
    to: '/b',
    unread: false,
  },
];

mockServer();

function inRouter(node: React.ReactNode) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={node} />
          <Route path="/signin" element={<h1>Sign in</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
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
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <NotificationList notices={notices} activity="/projects/p/activity" />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByRole('link', { name: 'All activity' })).toHaveAttribute(
      'href',
      '/projects/p/activity',
    );
  });

  it('marks an unread notice as read when it’s opened', async () => {
    const person = userEvent.setup();
    const onOpen = vi.fn();
    inRouter(<NotificationList notices={notices} onOpen={onOpen} />);

    await person.click(screen.getByRole('link', { name: /Qays Kaled marked BUG-007 as fixed/ }));

    expect(onOpen).toHaveBeenCalledWith('note-1');
  });

  it('shows at most six notices', () => {
    const many = Array.from({ length: 9 }, (_, index) => ({
      id: String(index),
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
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <NotificationsMenu notices={notices.map((notice) => ({ ...notice, unread: false }))} />
        </MemoryRouter>
      </QueryClientProvider>,
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

    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Account settings',
    ]);
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('signs out through the API and goes to Sign in', async () => {
    const person = userEvent.setup();
    inRouter(<AccountCard user={user} solo />);

    await person.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(getDb().signedIn).toBeNull();
  });
});

describe('AccountMenu', () => {
  it('opens the account card from the avatar', () => {
    inRouter(<AccountMenu user={user} solo />);
    const trigger = screen.getByRole('button', { name: 'Account, Batool Hani' });
    const panel = document.getElementById(trigger.getAttribute('popovertarget') ?? '');
    if (!panel) throw new Error('No account popover');

    expect(
      within(panel).getByRole('button', { name: 'Sign out', hidden: true }),
    ).toBeInTheDocument();
  });
});
