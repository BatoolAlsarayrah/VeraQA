import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from './ConfirmDialog';

function renderDelete(onConfirm = vi.fn()) {
  render(
    <ConfirmDialog
      open
      onClose={() => {}}
      title="Delete E-Commerce Portal v2?"
      confirmLabel="Delete forever"
      variant="danger-fill"
      onConfirm={onConfirm}
      typed={{ label: 'Project name', value: 'E-Commerce Portal v2' }}
    >
      Everything in the project will be deleted for everyone.
    </ConfirmDialog>,
  );
  return onConfirm;
}

describe('ConfirmDialog', () => {
  it('keeps a destructive action looking disabled until the name is typed', async () => {
    const user = userEvent.setup();
    const onConfirm = renderDelete();
    const confirm = screen.getByRole('button', { name: 'Delete forever' });

    expect(confirm).toHaveAttribute('aria-disabled', 'true');

    await user.type(screen.getByRole('textbox', { name: 'Project name' }), 'E-Commerce Portal v2');
    expect(confirm).not.toHaveAttribute('aria-disabled');

    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('says what to fix when the typed name does not match', async () => {
    const user = userEvent.setup();
    const onConfirm = renderDelete();
    const input = screen.getByRole('textbox', { name: 'Project name' });

    await user.type(input, 'E-Commerce');
    await user.click(screen.getByRole('button', { name: 'Delete forever' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(
      "That doesn't match. Type E-Commerce Portal v2 exactly.",
    );
  });
});
