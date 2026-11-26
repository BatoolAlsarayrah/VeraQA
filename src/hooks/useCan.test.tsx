import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { keys, queryClient } from '@/lib';
import { mockServer, signIn } from '@/mocks/server';

import { useCan } from './useCan';

mockServer();

beforeEach(async () => {
  await signIn();
});

function at(path: string) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/projects/:projectId/*" element={children} />
          <Route path="*" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('useCan', () => {
  it('reads the capabilities of the project in the URL', () => {
    const { result } = renderHook(() => useCan('approve'), {
      wrapper: at('/projects/e-commerce-portal-v2/requirements'),
    });

    expect(result.current).toBe(true);
  });

  it('answers per project, since one person holds different roles', () => {
    const { result } = renderHook(() => useCan('approve'), {
      wrapper: at('/projects/clinic-booking-app/requirements'),
    });

    expect(result.current).toBe(false);
  });

  it('falls back to the first project outside a project URL', () => {
    const { result } = renderHook(() => useCan('fix'), { wrapper: at('/account') });

    expect(result.current).toBe(false);
  });

  it('trusts the capabilities array over the role name', async () => {
    const session = await signIn();
    queryClient.setQueryData(keys.session, {
      ...session,
      memberships: session.memberships.map((entry) =>
        entry.projectId === 'payments-api' ? { ...entry, capabilities: [] } : entry,
      ),
    });
    const { result } = renderHook(() => useCan('fix'), {
      wrapper: at('/projects/payments-api/defects'),
    });

    expect(result.current).toBe(false);
  });
});
