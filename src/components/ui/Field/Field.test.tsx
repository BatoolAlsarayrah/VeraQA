import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from '../Input';
import { Field } from './Field';

describe('Field', () => {
  it('labels its control', () => {
    render(
      <Field label="Project name">
        <Input />
      </Field>,
    );

    expect(screen.getByRole('textbox', { name: 'Project name' })).toBeInTheDocument();
  });

  it('describes the control with its help text', () => {
    render(
      <Field label="Project name" help="Shown to everyone on the project.">
        <Input />
      </Field>,
    );

    expect(screen.getByRole('textbox')).toHaveAccessibleDescription(
      'Shown to everyone on the project.',
    );
  });

  it('marks the control invalid and reads the error first', () => {
    render(
      <Field
        label="Project name"
        help="Shown to everyone on the project."
        error="The name is empty. Type a name for the project."
      >
        <Input />
      </Field>,
    );
    const input = screen.getByRole('textbox');

    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(
      'The name is empty. Type a name for the project. Shown to everyone on the project.',
    );
  });

  it('marks a required control without triggering browser validation', () => {
    render(
      <Field label="Project name" required>
        <Input />
      </Field>,
    );
    const input = screen.getByRole('textbox');

    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).not.toHaveAttribute('required');
  });
});
