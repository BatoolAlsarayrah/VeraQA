import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { counts, renderAt as renderIn } from '@/mocks/render';
import { mockServer, signIn } from '@/mocks/server';

import { TabBar } from './TabBar';

function renderAt(path: string) {
  renderIn(path, <TabBar counts={counts} />);
  return screen.getByRole('navigation', { name: 'Main' });
}

mockServer();

beforeEach(async () => {
  await signIn();
});

describe('TabBar', () => {
  it('gives a QA lead Home, My work, Requirements, Defects and More, with counts in the names', () => {
    const bar = renderAt('/projects/e-commerce-portal-v2/requirements/REQ-014');
    for (const name of ['Home', 'My work, 6', 'Requirements, 5', 'Defects, 7']) {
      expect(within(bar).getByRole('link', { name })).toBeInTheDocument();
    }
    expect(within(bar).getAllByRole('link')).toHaveLength(4);
    expect(within(bar).getByRole('link', { name: 'Requirements, 5' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(bar).getByRole('button', { name: 'More' })).not.toHaveAttribute('aria-current');
  });

  it('gives a QA engineer Test runs instead of Requirements', () => {
    const bar = renderAt('/projects/clinic-booking-app/dashboard');

    expect(within(bar).getByRole('link', { name: 'Test runs' })).toBeInTheDocument();
    expect(within(bar).queryByRole('link', { name: /Requirements/ })).not.toBeInTheDocument();
  });

  it('marks More as current on a page that has no tab, and opens the sheet', async () => {
    const user = userEvent.setup();
    const bar = renderAt('/projects/e-commerce-portal-v2/traceability');
    const more = within(bar).getByRole('button', { name: 'More' });

    expect(more).toHaveAttribute('aria-current', 'page');
    await user.click(more);

    const sheet = screen.getByRole('dialog', { name: 'More' });
    expect(within(sheet).getByRole('link', { name: 'Traceability' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(sheet).getByRole('link', { name: 'Project settings' })).toBeInTheDocument();
    expect(within(sheet).getByRole('link', { name: 'Switch project' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('leaves manager links out of the More sheet for a QA engineer', async () => {
    const user = userEvent.setup();
    const bar = renderAt('/projects/clinic-booking-app/dashboard');

    await user.click(within(bar).getByRole('button', { name: 'More' }));

    const sheet = screen.getByRole('dialog', { name: 'More' });
    expect(within(sheet).getByRole('link', { name: 'Traceability' })).toBeInTheDocument();
    expect(within(sheet).queryByRole('link', { name: 'Members' })).not.toBeInTheDocument();
  });

  it('gives a developer four tabs and no More', () => {
    const bar = renderAt('/projects/payments-api/defects');
    const names = within(bar)
      .getAllByRole('link')
      .map((link) => link.textContent);

    expect(names).toEqual(['Your defects', 'Search', 'Alerts', 'Account']);
    expect(within(bar).queryByRole('button', { name: 'More' })).not.toBeInTheDocument();
  });
});
