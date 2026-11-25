import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MockChip } from './MockChip';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('MockChip', () => {
  it('shows in mock mode', () => {
    vi.stubEnv('VITE_API_MODE', 'mock');
    render(<MockChip />);

    expect(screen.getByText('Mock data')).toBeInTheDocument();
  });

  it('stays hidden against the live API', () => {
    vi.stubEnv('VITE_API_MODE', 'live');
    render(<MockChip />);

    expect(screen.queryByText('Mock data')).not.toBeInTheDocument();
  });
});
