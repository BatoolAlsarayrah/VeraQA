import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from './Badge';

describe('Badge', () => {
  it('always carries its word', () => {
    render(<Badge tone="ok">Approved</Badge>);

    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('adds the hollow ring only to the AI tone, hidden from screen readers', () => {
    const { container, rerender } = render(<Badge tone="ai">AI draft</Badge>);
    const ring = container.querySelector('[aria-hidden="true"]');

    expect(ring).toBeInTheDocument();
    expect(screen.getByText('AI draft')).toHaveTextContent('AI draft');

    rerender(<Badge tone="neutral">Not run</Badge>);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
  });
});
