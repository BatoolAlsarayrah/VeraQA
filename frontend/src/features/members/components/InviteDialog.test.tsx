import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { queryClient } from '@/lib';
import { mockServer } from '@/mocks/server';

import { InviteDialog } from './InviteDialog';

mockServer();

function setup() {
  const onSent = vi.fn();
  render(
    <QueryClientProvider client={queryClient}>
      <InviteDialog projectId="e-commerce-portal-v2" open onClose={vi.fn()} onSent={onSent} />
    </QueryClientProvider>,
  );
  return { onSent, user: userEvent.setup() };
}

describe('InviteDialog', () => {
  it('explains the chosen role', async () => {
    const { user } = setup();

    expect(screen.getByLabelText('Role')).toHaveAccessibleDescription(
      'QA engineers review, run tests and report defects. They can’t approve AI drafts.',
    );
    await user.selectOptions(screen.getByLabelText('Role'), 'qa-lead');
    expect(screen.getByLabelText('Role')).toHaveAccessibleDescription(
      'QA leads coordinate the work and approve requirements and AI drafts.',
    );
  });

  it('shows the server’s answer for someone already in the project', async () => {
    const { user, onSent } = setup();

    await user.type(screen.getByLabelText('Email addresses'), 'lina.saeed@shop-team.com');
    await user.click(screen.getByRole('button', { name: 'Send invites' }));

    expect(
      await screen.findByText('lina.saeed@shop-team.com is already in this project.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email addresses')).toHaveFocus();
    expect(onSent).not.toHaveBeenCalled();
  });

  it('accepts addresses split by commas, semicolons or spaces', async () => {
    const { user, onSent } = setup();

    await user.type(
      screen.getByLabelText('Email addresses'),
      'sami.odeh@shop-team.com; rana.f@shop-team.com  omar@uni.edu',
    );
    await user.click(screen.getByRole('button', { name: 'Send invites' }));

    await vi.waitFor(() =>
      expect(onSent).toHaveBeenCalledWith([
        'sami.odeh@shop-team.com',
        'rana.f@shop-team.com',
        'omar@uni.edu',
      ]),
    );
  });
});
