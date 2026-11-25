import { useCallback, useState } from 'react';

export const RAIL_KEY = 'veraqa-rail';

function stored() {
  try {
    return localStorage.getItem(RAIL_KEY) === 'collapsed';
  } catch {
    return false;
  }
}

export function useCollapsedRail() {
  const [collapsed, setCollapsed] = useState(stored);

  const toggle = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        if (next) localStorage.setItem(RAIL_KEY, 'collapsed');
        else localStorage.removeItem(RAIL_KEY);
      } catch {
        // Storage can be blocked; the rail still collapses for this visit.
      }
      return next;
    });
  }, []);

  return { collapsed, toggle };
}
