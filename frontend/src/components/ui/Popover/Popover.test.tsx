import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Popover } from './Popover';

describe('Popover', () => {
  it('ties its trigger to a named popover panel', () => {
    render(
      <Popover
        label="Notifications"
        align="end"
        trigger={(props) => (
          <button type="button" {...props}>
            Open notifications
          </button>
        )}
      >
        <p>3 unread</p>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Open notifications' });
    const panel = document.getElementById(trigger.getAttribute('popovertarget') ?? '');

    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(panel).toHaveAttribute('popover', 'auto');
    expect(panel).toHaveAttribute('role', 'dialog');
    expect(panel).toHaveAttribute('aria-label', 'Notifications');
  });

  it('places itself under the trigger when it opens', () => {
    render(
      <Popover
        label="Account"
        trigger={(props) => (
          <button type="button" {...props}>
            Account
          </button>
        )}
      >
        <p>Batool Hani</p>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Account' });
    const panel = document.getElementById(trigger.getAttribute('popovertarget') ?? '');

    panel?.showPopover();

    expect(panel?.style.top).toBe('8px');
  });
});
