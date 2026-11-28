import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('shows the first and last initials', () => {
    render(<Avatar name="Batool Hani Mahmoud" alt="Batool Hani Mahmoud" />);

    expect(screen.getByRole('img', { name: 'Batool Hani Mahmoud' })).toHaveTextContent('BM');
  });

  it('is decorative beside a visible name', () => {
    const { container } = render(<Avatar name="Qays Kaled" />);

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('keeps a short one-word name whole', () => {
    render(<Avatar name="AI" alt="AI analysis" />);

    expect(screen.getByRole('img', { name: 'AI analysis' })).toHaveTextContent('AI');
  });
});
