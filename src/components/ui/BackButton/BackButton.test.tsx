import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BackButton } from './BackButton';

describe('BackButton', () => {
  it('names the list it returns to', () => {
    render(<BackButton href="/defects" label="Defects" />);

    expect(screen.getByRole('link', { name: 'Back to Defects' })).toHaveAttribute(
      'href',
      '/defects',
    );
  });
});
