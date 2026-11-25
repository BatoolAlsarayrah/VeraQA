import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { SoloLayout } from './SoloLayout';

describe('SoloLayout', () => {
  it('heads the page with the logo linking to the projects list', () => {
    render(
      <MemoryRouter>
        <SoloLayout end={<span>BH</span>}>
          <h1>Your projects</h1>
        </SoloLayout>
      </MemoryRouter>,
    );

    expect(screen.getByRole('banner')).toContainElement(
      screen.getByRole('link', { name: 'VeraQA, your projects' }),
    );
    expect(screen.getByRole('link', { name: 'VeraQA, your projects' })).toHaveAttribute(
      'href',
      '/projects',
    );
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { name: 'Your projects' }),
    );
    expect(screen.getByText('BH')).toBeInTheDocument();
  });
});
