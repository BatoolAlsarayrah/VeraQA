import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Sheet } from './Sheet';

describe('Sheet', () => {
  it('opens as a named modal and closes on Esc', () => {
    const onClose = vi.fn();
    render(
      <Sheet open onClose={onClose} title="More">
        <a href="/reports">Reports</a>
      </Sheet>,
    );
    const sheet = screen.getByRole('dialog', { name: 'More' });

    expect(sheet).toHaveAttribute('open');
    fireEvent(sheet, new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
