import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';

import { queryClient } from '@/lib';

export const counts = { myWork: 6, pendingReview: 5, openDefects: 7 };

export function notices(total: number, unread: number) {
  return Array.from({ length: total }, (_, index) => ({
    id: `note-${String(index)}`,
    title: `Notice ${String(index)}`,
    time: 'Today',
    to: '/x',
    unread: index < unread,
  }));
}

export function renderAt(path: string, element: ReactNode) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/projects/:projectId/*" element={element} />
          <Route path="*" element={element} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
