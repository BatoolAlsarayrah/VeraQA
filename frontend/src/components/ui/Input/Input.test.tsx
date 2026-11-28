import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Input } from './Input';

describe('Input', () => {
  it('takes typing and passes its ref through for forms', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    render(<Input aria-label="Search" ref={ref} />);

    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'REQ-014');

    expect(ref.current).toHaveValue('REQ-014');
  });
});
