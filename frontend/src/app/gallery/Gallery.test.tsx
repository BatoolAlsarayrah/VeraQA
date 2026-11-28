import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { ToastProvider } from '@/components/ui';

import { Gallery } from './Gallery';

function renderGallery() {
  render(
    <MemoryRouter>
      <ToastProvider>
        <Gallery />
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('Gallery', () => {
  it('has a section for every part of the design system', () => {
    renderGallery();

    for (const title of [
      'Type scale',
      'Colors',
      'Icons',
      'Buttons',
      'Badges and marks',
      'Form fields',
      'Panels, tabs and states',
      'Overlays',
      'AI suggestion',
    ]) {
      expect(screen.getByRole('region', { name: title })).toBeInTheDocument();
    }
  });

  it('shows Pending review both ways and the optional field label', () => {
    renderGallery();

    expect(screen.getAllByText('Pending review').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByRole('textbox', { name: 'Target date (optional)' })).toBeInTheDocument();
  });

  it('opens a dialog from its button and closes it with Cancel', async () => {
    const user = userEvent.setup();
    renderGallery();
    const trigger = screen.getByRole('button', { name: 'Reject REQ-015' });

    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Reject REQ-015' })).toHaveAttribute('open');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(trigger).toHaveFocus();
  });

  it('shows a toast from its button', async () => {
    const user = userEvent.setup();
    renderGallery();

    await user.click(screen.getByRole('button', { name: 'Show a toast' }));

    expect(screen.getByRole('status')).toHaveTextContent('Theme set to dark');
  });
});
