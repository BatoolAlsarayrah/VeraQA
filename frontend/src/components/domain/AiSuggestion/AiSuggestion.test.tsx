import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AiSuggestion } from './AiSuggestion';

function Rewrite() {
  return (
    <>
      Users shall be able to reset their password <del>at any time</del>{' '}
      <ins>through an emailed link that stays valid for 1 hour</ins>.
    </>
  );
}

describe('AiSuggestion', () => {
  it('shows the suggestion with its accept and edit actions', async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    render(
      <AiSuggestion onAccept={onAccept} onEdit={() => {}}>
        <Rewrite />
      </AiSuggestion>,
    );

    expect(screen.getByRole('heading', { name: 'Suggested rewrite' })).toBeInTheDocument();
    expect(screen.getByRole('deletion')).toHaveTextContent('at any time');
    expect(screen.getByRole('insertion')).toHaveTextContent('through an emailed link');

    await user.click(screen.getByRole('button', { name: 'Accept rewrite' }));
    expect(onAccept).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Edit text' })).toBeInTheDocument();
  });

  it('shows no actions to someone who cannot act on it', () => {
    render(
      <AiSuggestion>
        <Rewrite />
      </AiSuggestion>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('says an accepted rewrite still needs approval and drops its actions', () => {
    render(
      <AiSuggestion accepted onAccept={() => {}} onEdit={() => {}}>
        <Rewrite />
      </AiSuggestion>,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Suggested rewrite · accepted, still needs your approval',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
