import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FormError } from './FormError';

describe('FormError', () => {
  it('announces the message', () => {
    render(<FormError message="That email and password don’t match. Try again." />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'That email and password don’t match. Try again.',
    );
  });

  it('stays in the page empty so a later message is announced', () => {
    render(<FormError message={null} />);

    expect(screen.getByRole('alert', { hidden: true })).toBeEmptyDOMElement();
  });
});
