import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ChoiceCard } from './ChoiceCard';

describe('ChoiceCard', () => {
  it('acts as one radio in its group', async () => {
    const user = userEvent.setup();
    render(
      <fieldset>
        <legend>How will you work?</legend>
        <ChoiceCard name="mode" value="solo" title="On my own" caption="Only you on the project" />
        <ChoiceCard name="mode" value="team" title="With a team" caption="Invite people later" />
      </fieldset>,
    );

    await user.click(screen.getByText('With a team'));

    const team = screen.getByRole('radio', { name: 'With a team' });
    expect(team).toBeChecked();
    expect(team).toHaveAccessibleDescription('Invite people later');
    expect(screen.getByRole('radio', { name: 'On my own' })).not.toBeChecked();
  });
});
