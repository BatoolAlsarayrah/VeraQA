import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Field } from '../Field';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
  it('hides the password until asked, then hides it again', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    render(
      <Field label="Password">
        <PasswordInput ref={ref} autoComplete="current-password" />
      </Field>,
    );
    const input = screen.getByLabelText('Password');

    await user.type(input, 'VeraQA#2026');
    expect(input).toHaveAttribute('type', 'password');
    expect(ref.current).toHaveValue('VeraQA#2026');

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('keeps the field’s error wiring', () => {
    render(
      <Field label="Password" error="Enter your password.">
        <PasswordInput />
      </Field>,
    );

    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Enter your password.');
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
  });
});
