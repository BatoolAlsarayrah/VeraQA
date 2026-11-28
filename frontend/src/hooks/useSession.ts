import { useSuspenseQuery } from '@tanstack/react-query';

import { sessionQuery } from '@/lib';

export function useSession() {
  return useSuspenseQuery(sessionQuery).data;
}
