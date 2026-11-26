import { act, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { rememberAnalysis } from '@/features/requirements';
import { request } from '@/lib';
import { setFlags } from '@/mocks/api';
import { getDb } from '@/mocks/db';
import { mockServer } from '@/mocks/server';
import { JobStart } from '@/types';

import { Providers } from '../providers';
import { routes } from './routes';

mockServer();

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

function analyze(text = 'The system shall export orders.\nThe cart shall update quickly.') {
  return request(`${lead}/requirements/typed`, JobStart, { method: 'POST', body: { text } });
}

afterEach(() => {
  vi.useRealTimers();
});

describe('analysis banner', () => {
  it('follows a running analysis through its steps, then says what it found', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    setFlags({ instantJobs: false });
    await analyze();
    visit(`${lead}/dashboard`);

    expect(await screen.findByText('Analyzing your requirements, step 1 of 4')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open analysis' })).toHaveAttribute(
      'href',
      `${lead}/requirements/analysis`,
    );

    await act(() => vi.advanceTimersByTimeAsync(11_000));

    expect(
      await screen.findByText('Analysis complete: 2 requirements, 1 issue'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Review' })).toHaveAttribute(
      'href',
      `${lead}/requirements`,
    );
  });

  it('stays off the Add requirements and AI analysis pages', async () => {
    setFlags({ instantJobs: false });
    await analyze();
    visit(`${lead}/requirements/new`);

    expect(await screen.findByRole('heading', { name: 'Add requirements' })).toBeInTheDocument();
    expect(banner()).toBeNull();
  });

  it('stays off for someone who cannot add requirements', async () => {
    getDb().signedIn = 'batool-mahmoud';
    setFlags({ instantJobs: false });
    visit(`${lead}/dashboard`);

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(banner()).toBeNull();
  });

  it('goes away once a finished analysis is seen on Requirements', async () => {
    const { jobId } = await analyze();
    rememberAnalysis('e-commerce-portal-v2', jobId);
    visit(`${lead}/requirements`);

    expect(await screen.findByRole('heading', { name: 'Requirements' })).toBeInTheDocument();
    await waitFor(() => {
      expect(sessionStorage.getItem('veraqa-analysis')).toBe('{}');
    });
    expect(banner()).toBeNull();
  });
});
