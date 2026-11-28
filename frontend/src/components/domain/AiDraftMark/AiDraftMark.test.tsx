import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AiDraftMark } from './AiDraftMark';

describe('AiDraftMark', () => {
  it('pairs the ring with the words AI draft', () => {
    render(<AiDraftMark label />);

    expect(screen.getByText('AI draft')).toBeInTheDocument();
  });

  it('keeps a lone ring out of the accessibility tree', () => {
    const { container } = render(<AiDraftMark />);

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(container).toHaveTextContent('');
  });
});
