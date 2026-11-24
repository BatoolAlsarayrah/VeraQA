import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PriorityBadge } from './PriorityBadge';

describe('PriorityBadge', () => {
  it.each([
    ['critical', 'Critical', 'bg-bad-fill'],
    ['high', 'High', 'bg-bad-bg'],
    ['medium', 'Medium', 'bg-warn-bg'],
    ['low', 'Low', 'bg-neutral-bg'],
  ] as const)('shows %s as a word with its color', (level, label, fill) => {
    render(<PriorityBadge level={level} />);

    expect(screen.getByText(label)).toHaveClass(fill);
  });
});
