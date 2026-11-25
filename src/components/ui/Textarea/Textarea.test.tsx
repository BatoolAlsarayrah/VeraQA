import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Field } from '../Field';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('is labelled by its field and takes multi-line text', async () => {
    const user = userEvent.setup();
    render(
      <Field label="Requirements">
        <Textarea />
      </Field>,
    );
    const textarea = screen.getByRole('textbox', { name: 'Requirements' });

    await user.type(textarea, 'The system shall{Enter}Users shall');

    expect(textarea).toHaveValue('The system shall\nUsers shall');
  });
});
