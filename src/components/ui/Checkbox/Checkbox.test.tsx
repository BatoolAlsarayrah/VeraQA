import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('toggles from its label and from the keyboard', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Include closed defects" />);
    const box = screen.getByRole('checkbox', { name: 'Include closed defects' });

    await user.click(screen.getByText('Include closed defects'));
    expect(box).toBeChecked();

    await user.keyboard(' ');
    expect(box).not.toBeChecked();
  });
});
