import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FlaggedText } from './FlaggedText';

describe('FlaggedText', () => {
  it('marks the phrase and names its findings for screen readers', () => {
    render(
      <p>
        Users shall be able to reset their password{' '}
        <FlaggedText findings={[2, 3]}>at any time</FlaggedText>.
      </p>,
    );
    const phrase = screen.getByRole('mark');

    expect(phrase).toHaveTextContent('at any time finding 2,3');
    expect(phrase.querySelector('sup')).toHaveTextContent('2,3');
  });

  it('takes the stronger wash while its finding is highlighted', () => {
    render(
      <FlaggedText findings={[1]} active>
        reset their password
      </FlaggedText>,
    );

    expect(screen.getByRole('mark')).toHaveClass('bg-ai-active');
  });
});
