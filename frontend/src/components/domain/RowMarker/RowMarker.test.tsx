import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RowMarker } from './RowMarker';

describe('RowMarker', () => {
  it.each([
    ['draft', 'AI draft'],
    ['approved', 'Approved'],
    ['approved-case', 'Approved'],
    ['rejected', 'Rejected'],
  ] as const)('keeps the word for screen readers on %s rows', (state, word) => {
    render(<RowMarker state={state} />);

    expect(screen.getByText(word)).toHaveClass('sr-only');
  });

  it('fills the hollow ring when the row is approved', () => {
    const { container, rerender } = render(<RowMarker state="draft" />);
    const mark = container.querySelector('[aria-hidden="true"]');
    expect(mark).toHaveClass('bg-surface', 'border-ai');

    rerender(<RowMarker state="approved" />);
    expect(mark).toHaveClass('bg-ok-fill');
  });
});
