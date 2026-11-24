import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LinkButton } from './LinkButton';

describe('LinkButton', () => {
  it('navigates as a link with the button look', () => {
    render(
      <LinkButton href="/requirements" variant="primary">
        Review
      </LinkButton>,
    );

    expect(screen.getByRole('link', { name: 'Review' })).toHaveAttribute('href', '/requirements');
  });
});
