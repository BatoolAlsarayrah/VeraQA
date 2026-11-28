import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('runs its action on click and from the keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Approve</Button>);

    await user.click(screen.getByRole('button', { name: 'Approve' }));
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('stays focusable when disabled but ignores clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Approve
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Approve' });

    await user.tab();
    await user.click(button);

    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toHaveAttribute('disabled');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('still submits its form when disabled, so the form can point at the field to fix', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Button type="submit" disabled>
          Create project
        </Button>
      </form>,
    );

    await user.click(screen.getByRole('button', { name: 'Create project' }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('marks itself busy while loading, keeps its label and ignores clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });

    await user.click(button);

    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('reads Approved once approved', () => {
    render(
      <Button variant="primary" approved>
        Approve requirement
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Approved' })).toBeInTheDocument();
  });

  it('names an icon-only button from its label', () => {
    render(<Button icon="x" aria-label="Close" />);

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});
