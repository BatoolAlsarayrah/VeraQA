import { useCallback, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

/** localStorage key. The inline script in index.html reads the same key. */
export const THEME_STORAGE_KEY = 'veraqa-theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

const listeners = new Set<() => void>();
let detach: (() => void) | null = null;

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

function readSaved(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
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

/** The data-theme attribute on <html> is the single source of truth. */
function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function apply(theme: Theme) {
  if (document.documentElement.dataset.theme === theme) return;
  document.documentElement.dataset.theme = theme;
  listeners.forEach((listener) => listener());
}

function attach() {
  // Another tab picked a theme (or cleared it).
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    apply(readSaved() ?? systemTheme());
  };
  window.addEventListener('storage', onStorage);

  // The OS theme changed: follow it only while nothing is saved.
  const media = typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null;
  const onMedia = () => {
    if (!readSaved()) apply(systemTheme());
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

/** Sets the theme and saves it on this device. */
function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode). The theme still applies for this visit.
  }
  apply(theme);
}

/**
 * Light or dark, shared by every component. A first visit follows the OS;
 * the choice is saved in localStorage only once the person picks.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot);
  const setTheme = useCallback((next: Theme) => saveTheme(next), []);
  const toggleTheme = useCallback(() => saveTheme(getSnapshot() === 'dark' ? 'light' : 'dark'), []);
  return { theme, setTheme, toggleTheme };
}
