import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Logo } from './Logo';

describe('Logo', () => {
  it('names the mark when it stands alone', () => {
    render(<Logo size={32} />);

    const mark = screen.getByRole('img', { name: 'VeraQA' });
    expect(mark).toHaveAttribute('width', '32');
  });

  it('hides the mark from screen readers when the name is shown', () => {
    render(<Logo withName />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('VeraQA')).toBeInTheDocument();
  });
});
