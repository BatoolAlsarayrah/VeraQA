import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('uses the PRODUCT.md wording', () => {
    render(<StatusBadge status="pending-review" />);

    expect(screen.getByText('Pending review')).toBeInTheDocument();
  });

  it('gives pending review on an AI-made item the AI-draft look, with the same words', () => {
    const { container } = render(<StatusBadge status="pending-review" ai />);

    expect(screen.getByText('Pending review')).toHaveClass('bg-ai-bg');
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('ignores the AI flag on statuses a person set', () => {
    render(<StatusBadge status="approved" ai />);

    expect(screen.getByText('Approved')).toHaveClass('bg-ok-bg');
  });

  it('shows reopened as solid clay', () => {
    render(<StatusBadge status="reopened" />);

    expect(screen.getByText('Reopened')).toHaveClass('bg-bad-fill');
  });
});
