import { useCallback, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

// The inline script in index.html reads the same key.
export const THEME_KEY = 'veraqa-theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

const listeners = new Set<() => void>();
let detach: (() => void) | null = null;

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches
    ? 'dark'
    : 'light';
}

// The inline script sets data-theme before React loads, so the attribute is the source of truth.
function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  if (document.documentElement.dataset.theme === theme) return;
  document.documentElement.dataset.theme = theme;
  listeners.forEach((listener) => listener());
}

function attach() {
  // key is null when another tab calls localStorage.clear().
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_KEY && event.key !== null) return;
    applyTheme(savedTheme() ?? systemTheme());
  };
  window.addEventListener('storage', onStorage);

  const media = typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null;
  const onMedia = () => {
    if (!savedTheme()) applyTheme(systemTheme());
  };
  media?.addEventListener('change', onMedia);

  return () => {
    window.removeEventListener('storage', onStorage);
    media?.removeEventListener('change', onMedia);
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!detach) detach = attach();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && detach) {
      detach();
      detach = null;
    }
  };
}

function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage can be blocked (private browsing); the theme still applies for this visit.
  }
  applyTheme(theme);
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, currentTheme);
  const setTheme = useCallback((next: Theme) => saveTheme(next), []);
  const toggleTheme = useCallback(
    () => saveTheme(currentTheme() === 'dark' ? 'light' : 'dark'),
    [],
  );
  return { theme, setTheme, toggleTheme };
}
