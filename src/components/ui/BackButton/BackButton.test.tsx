import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { BackButton } from './BackButton';

describe('BackButton', () => {
  it('names the list it returns to', () => {
    render(
      <MemoryRouter>
        <BackButton to="/defects" label="Defects" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Back to Defects' })).toHaveAttribute(
      'href',
      '/defects',
    );
  });
});
