import { useSyncExternalStore } from 'react';

import { getSession, subscribeSession } from '@/lib';

export function useSession() {
  return useSyncExternalStore(subscribeSession, getSession);
}
