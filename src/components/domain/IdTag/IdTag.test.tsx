import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { IdTag } from './IdTag';

describe('IdTag', () => {
  it('shows a plain ID in the mono face', () => {
    render(<IdTag>REQ-014</IdTag>);

    expect(screen.getByText('REQ-014')).toHaveClass('text-id');
  });

  it('links to the item when given a destination', () => {
    render(
      <MemoryRouter>
        <IdTag to="/requirements/REQ-014">REQ-014</IdTag>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'REQ-014' })).toHaveAttribute(
      'href',
      '/requirements/REQ-014',
    );
  });
});
