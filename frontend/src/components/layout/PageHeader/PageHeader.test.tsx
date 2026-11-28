import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('shows the title as the page heading with its lede and actions', () => {
    render(
      <PageHeader
        title="Test runs"
        lede="Run 12 · Sprint 4 regression"
        actions={<button type="button">New test run</button>}
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Test runs' })).toBeInTheDocument();
    expect(screen.getByText('Run 12 · Sprint 4 regression')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New test run' })).toBeInTheDocument();
  });

  it('links back to the parent page', () => {
    render(
      <MemoryRouter>
        <PageHeader
          title="REQ-014"
          back={{ to: '/projects/p/requirements', label: 'Requirements' }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Back to Requirements' })).toHaveAttribute(
      'href',
      '/projects/p/requirements',
    );
  });

  it('leaves out the back link and actions when they are not given', () => {
    render(<PageHeader title="Dashboard" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
