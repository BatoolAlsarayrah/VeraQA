import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  it('puts the form in the main landmark beside the brand panel', () => {
    render(
      <AuthLayout>
        <h1>Sign in</h1>
      </AuthLayout>,
    );

    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { name: 'Sign in' }),
    );
    expect(screen.getByText("Ship what's true.")).toBeInTheDocument();
    expect(
      screen.getByText(
        'From SRS to the last defect, every requirement is verified and every bug traces back to its source.',
      ),
    ).toBeInTheDocument();
  });

  it('keeps the drawing decorative and leaves out university text', () => {
    const { container } = render(
      <AuthLayout>
        <h1>Sign in</h1>
      </AuthLayout>,
    );

    expect(container.querySelector('svg[viewBox="0 0 688 405"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(container).not.toHaveTextContent(/university|graduation|faculty/i);
  });
});
