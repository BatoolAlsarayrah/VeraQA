import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { MoreSheet } from './MoreSheet';

function renderAt(path: string, onClose = vi.fn()) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/projects/:projectId/*" element={<MoreSheet open onClose={onClose} />} />
      </Routes>
    </MemoryRouter>,
  );
  return screen.getByRole('dialog', { name: 'More' });
}

describe('MoreSheet', () => {
  it('lists the testing stages with the counts a QA lead acts on', () => {
    const sheet = renderAt('/projects/e-commerce-portal-v2/scenarios');

    expect(within(sheet).getByRole('heading', { name: 'Testing stages' })).toBeInTheDocument();
    expect(within(sheet).getByRole('link', { name: 'Requirements 5' })).toBeInTheDocument();
    expect(within(sheet).getByRole('link', { name: 'Defects 7' })).toBeInTheDocument();
    expect(within(sheet).getByRole('link', { name: 'Test scenarios' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('shows the person and their role in the project', () => {
    const sheet = renderAt('/projects/library-system/dashboard');

    expect(
      within(sheet).getByRole('link', { name: 'Batool Hani Project manager in Library system' }),
    ).toHaveAttribute('href', '/account');
  });

  it('leaves out the pending count for someone who cannot approve', () => {
    const sheet = renderAt('/projects/clinic-booking-app/dashboard');

    expect(within(sheet).getByRole('link', { name: 'Requirements' })).toBeInTheDocument();
  });

  it('closes from the Close button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const sheet = renderAt('/projects/e-commerce-portal-v2/dashboard', onClose);

    await user.click(within(sheet).getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });
});
