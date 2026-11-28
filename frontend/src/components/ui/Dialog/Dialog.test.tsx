import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Dialog } from './Dialog';

function Example({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Approve all
      </button>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        title="Approve 3 requirements?"
        actions={
          <button type="button" onClick={() => setOpen(false)}>
            Cancel
          </button>
        }
      >
        These have no open AI findings.
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  it('opens as a modal dialog named by its title', async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole('button', { name: 'Approve all' }));

    expect(screen.getByRole('dialog', { name: 'Approve 3 requirements?' })).toHaveAttribute('open');
  });

  it('closes on Esc', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Example onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Approve all' }));

    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open');
  });

  it('closes on a scrim click but not on a click inside', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Example onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Approve all' }));

    await user.click(screen.getByText('These have no open AI findings.'));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('returns focus to the trigger when it closes', async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Approve all' });
    await user.click(trigger);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(trigger).toHaveFocus();
  });
});
