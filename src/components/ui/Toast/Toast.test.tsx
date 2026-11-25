import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider } from './ToastProvider';
import { useToast } from './useToast';

function Trigger({ undo }: { undo?: () => void }) {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast('BUG-007 moved to Fixed', undo ? { undo } : {})}>
      Move
    </button>
  );
}

function wait(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function renderToast(undo?: () => void) {
  render(
    <ToastProvider>
      <Trigger {...(undo ? { undo } : {})} />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Move' }));
}

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('announces politely and clears after 2.6s', () => {
    renderToast();

    expect(screen.getByRole('status')).toHaveTextContent('BUG-007 moved to Fixed');
    wait(2599);
    expect(screen.getByRole('status')).toHaveTextContent('BUG-007 moved to Fixed');
    wait(1);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('offers Undo for 6s', () => {
    const undo = vi.fn();
    renderToast(undo);

    wait(5000);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(undo).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('waits while the pointer rests on it', () => {
    renderToast();
    const toast = screen.getByText('BUG-007 moved to Fixed').parentElement as HTMLElement;

    wait(2000);
    fireEvent.pointerEnter(toast);
    wait(10000);
    expect(screen.getByRole('status')).toHaveTextContent('BUG-007 moved to Fixed');

    fireEvent.pointerLeave(toast);
    wait(600);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('needs a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger />)).toThrow('useToast needs a ToastProvider above it');
  });
});
