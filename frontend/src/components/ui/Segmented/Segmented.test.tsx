import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Segmented } from './Segmented';

function Example() {
  const [value, setValue] = useState<'upload' | 'write'>('upload');
  return (
    <Segmented
      name="input"
      label="How to add requirements"
      value={value}
      onChange={setValue}
      options={[
        { value: 'upload', label: 'Upload SRS' },
        { value: 'write', label: 'Write them in' },
      ]}
    />
  );
}

describe('Segmented', () => {
  it('is a named group of radios', () => {
    render(<Example />);

    expect(screen.getByRole('group', { name: 'How to add requirements' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Upload SRS' })).toBeChecked();
  });

  it('changes with a click and with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByText('Write them in'));
    expect(screen.getByRole('radio', { name: 'Write them in' })).toBeChecked();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Upload SRS' })).toBeChecked();
  });
});
