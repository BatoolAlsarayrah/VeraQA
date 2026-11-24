import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Switch } from './Switch';

describe('Switch', () => {
  it('is a labelled switch that turns on and off', async () => {
    const user = userEvent.setup();
    render(<Switch label="Allow bulk approval" description="Approve several items at once." />);
    const control = screen.getByRole('switch', { name: 'Allow bulk approval' });

    expect(control).toHaveAccessibleDescription('Approve several items at once.');
    await user.click(control);
    expect(control).toBeChecked();
    await user.keyboard(' ');
    expect(control).not.toBeChecked();
  });

  it('stays on when locked by a product rule and says why', async () => {
    const user = userEvent.setup();
    render(<Switch label="Notify on reopened defects" locked />);
    const control = screen.getByRole('switch', { name: 'Notify on reopened defects' });

    await user.click(control);

    expect(control).toBeChecked();
    expect(control).toHaveAttribute('aria-disabled', 'true');
    expect(control).toHaveAccessibleDescription('Always on');
  });
});
