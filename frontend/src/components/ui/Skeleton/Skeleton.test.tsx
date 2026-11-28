import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('draws the requested lines and stays out of the accessibility tree', () => {
    const { container } = render(<Skeleton lines={3} />);
    const root = container.firstElementChild;

    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root?.children).toHaveLength(3);
  });
});
