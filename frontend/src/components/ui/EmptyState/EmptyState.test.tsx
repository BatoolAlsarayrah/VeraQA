import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('says what is missing and offers the next step', () => {
    render(
      <EmptyState
        title="No requirements yet"
        action={<button type="button">Add requirements</button>}
      >
        Upload the SRS or type the requirements in.
      </EmptyState>,
    );

    expect(screen.getByText('No requirements yet')).toBeInTheDocument();
    expect(screen.getByText('Upload the SRS or type the requirements in.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add requirements' })).toBeInTheDocument();
  });
});
