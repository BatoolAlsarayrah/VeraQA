import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('shows on focus, hides on Esc and blur, and never replaces the link name', async () => {
    const user = userEvent.setup();
    const show = vi.spyOn(HTMLElement.prototype, 'showPopover');
    const hide = vi.spyOn(HTMLElement.prototype, 'hidePopover');
    render(
      <Tooltip label="Dashboard">
        <a href="/dashboard" aria-label="Dashboard">
          D
        </a>
      </Tooltip>,
    );

    await user.tab();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveFocus();
    expect(show).toHaveBeenCalledOnce();

    await user.keyboard('{Escape}');
    expect(hide).toHaveBeenCalledOnce();

    await user.tab();
    expect(hide).toHaveBeenCalledOnce();
    expect(screen.getByText('Dashboard', { selector: '[popover]' })).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
