import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { AppShell } from './AppShell';
import { usePhoneDetail } from './detail';

function Detail() {
  usePhoneDetail(true);
  return <p>REQ-014</p>;
}

function Toggle() {
  const [open, setOpen] = useState(true);
  return (
    <AppShell>
      <button type="button" onClick={() => setOpen(false)}>
        Back to the list
      </button>
      {open && <Detail />}
    </AppShell>
  );
}

describe('AppShell', () => {
  it('offers a skip link as the first stop that leads to the main content', async () => {
    const user = userEvent.setup();
    render(
      <AppShell>
        <h1>Dashboard</h1>
      </AppShell>,
    );

    await user.tab();
    const skip = screen.getByRole('link', { name: 'Skip to main content' });

    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute('href', '#main');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
  });

  it('holds narrow task pages to the 800px column', () => {
    render(
      <AppShell narrow>
        <h1>Add requirements</h1>
      </AppShell>,
    );

    expect(screen.getByRole('heading').parentElement).toHaveClass('max-w-200');
  });

  it('lets a page ask for the phone detail view, and lets go when it leaves', async () => {
    const user = userEvent.setup();
    const { container } = render(<Toggle />);
    const frame = container.firstElementChild;

    expect(frame).toHaveAttribute('data-detail', 'true');

    await user.click(screen.getByRole('button', { name: 'Back to the list' }));
    expect(frame).not.toHaveAttribute('data-detail');
  });
});
