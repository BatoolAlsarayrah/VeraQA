import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Field } from '../Field';
import { Select } from './Select';

describe('Select', () => {
  it('is a labelled native select', async () => {
    const user = userEvent.setup();
    render(
      <Field label="Test run">
        <Select defaultValue="">
          <option value="" disabled>
            Choose
          </option>
          <option value="12">Run 12 · Sprint 4 regression</option>
        </Select>
      </Field>,
    );
    const select = screen.getByRole('combobox', { name: 'Test run' });

    await user.selectOptions(select, '12');

    expect(select).toHaveValue('12');
  });
});
