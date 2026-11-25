import { QueryClient } from '@tanstack/react-query';

import { ContractError, HttpError } from './api-client';

function shouldRetry(failures: number, error: Error) {
  if (error instanceof ContractError) return false;
  if (error instanceof HttpError && error.status < 500) return false;
  return failures < 1;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
        throwOnError: (error) => error instanceof ContractError,
      },
      mutations: {
        retry: false,
        throwOnError: (error) => error instanceof ContractError,
      },
    },
  });
}

export const queryClient = createQueryClient();

// Every key starts with what it belongs to, so invalidating a prefix refreshes everything under it.
export const keys = {
  session: ['session'] as const,
  projects: ['projects'] as const,
  invitations: ['invitations'] as const,
  project: (projectId: string) => ['projects', projectId] as const,
  notifications: (projectId: string) => ['notifications', projectId] as const,
  job: (jobId: string) => ['jobs', jobId] as const,
};
