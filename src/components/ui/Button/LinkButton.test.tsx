import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { LinkButton } from './LinkButton';

describe('LinkButton', () => {
  it('navigates as a router link with the button look', () => {
    render(
      <MemoryRouter>
        <LinkButton to="/requirements" variant="primary">
          Review
        </LinkButton>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Review' })).toHaveAttribute('href', '/requirements');
  });
});
