import { useEffect } from 'react';

import { setPageTitle } from '@/lib';

export function usePageTitle(title: string | null) {
  useEffect(() => {
    setPageTitle(title);
    return () => setPageTitle(null);
  }, [title]);
}
