import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { demoSession, getDemoAnalysis, getSession, setDemoAnalysis, setSession } from '@/lib';

import { Providers } from '../providers';
import { routes } from './routes';

const lead = '/projects/e-commerce-portal-v2';

function banner() {
  return screen.queryByText(/^(Analyzing|Analysis complete)/)?.closest('[role="status"]') ?? null;
}

function visit(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return router;
}

afterEach(() => {
  vi.useRealTimers();
  setDemoAnalysis(null);
  sessionStorage.clear();
  setSession(demoSession());
});

describe('analysis banner', () => {
  it('counts through the steps, then turns into Analysis complete with Review', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    setDemoAnalysis({
      files: ['SRS_v2.pdf', 'Checkout_flow.docx'],
      startedAt: Date.now(),
      done: false,
    });
    visit(`${lead}/dashboard`);

    await screen.findByText('Analyzing 2 files, step 1 of 4');
    const strip = banner();
    if (!(strip instanceof HTMLElement)) throw new Error('No banner');
    expect(within(strip).getByRole('link', { name: 'Open analysis' })).toHaveAttribute(
      'href',
      `${lead}/requirements/analysis`,
    );

    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(strip).toHaveTextContent('step 2 of 4');

    await act(() => vi.advanceTimersByTimeAsync(4000));
    expect(banner()).toHaveTextContent('Analysis complete: 26 requirements, 8 issues');
    expect(screen.getByRole('link', { name: 'Review' })).toHaveAttribute(
      'href',
      `${lead}/requirements`,
    );
  });

  it('stays off the Add requirements and AI analysis pages', async () => {
    setDemoAnalysis({ files: ['SRS_v2.pdf'], startedAt: Date.now(), done: false });
    visit(`${lead}/requirements/new`);

    expect(await screen.findByRole('heading', { name: 'Add requirements' })).toBeInTheDocument();
    expect(banner()).toBeNull();
  });

  it('stays off for someone who cannot add requirements', async () => {
    setDemoAnalysis({ files: ['SRS_v2.pdf'], startedAt: Date.now(), done: false });
    visit('/projects/clinic-booking-app/dashboard');

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(banner()).toBeNull();
  });

  it('clears once a finished analysis is seen on Requirements', async () => {
    setDemoAnalysis({ files: ['SRS_v2.pdf'], startedAt: 0, done: true });
    visit(`${lead}/requirements`);

    expect(await screen.findByRole('heading', { name: 'Requirements' })).toBeInTheDocument();
    expect(banner()).toBeNull();
    expect(getDemoAnalysis()).toBeNull();
  });
});

describe('dev page', () => {
  it('switches the role for a project', async () => {
    const user = userEvent.setup();
    visit('/dev');

    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'E-Commerce Portal v2' }),
      'developer',
    );

    const membership = getSession().memberships.find(
      (entry) => entry.projectId === 'e-commerce-portal-v2',
    );
    expect(membership?.role).toBe('developer');
    expect(membership?.capabilities).toEqual(['fix']);
  });

  it('starts an analysis', async () => {
    const user = userEvent.setup();
    visit('/dev');

    await user.click(await screen.findByRole('button', { name: 'Start with 1 file' }));

    expect(getDemoAnalysis()?.files).toEqual(['SRS_v2.pdf']);
  });
});
