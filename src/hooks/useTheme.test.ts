import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import indexHtml from '../../index.html?raw';
import { type Theme, THEME_KEY, useTheme } from './useTheme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

// jsdom has no matchMedia, so this stands in for the OS appearance setting.
function mockSystemTheme(initial: Theme) {
  let matches = initial === 'dark';
  const listeners = new Set<() => void>();
  const media = {
    get matches() {
      return matches;
    },
    media: DARK_QUERY,
    addEventListener: (_type: 'change', listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: 'change', listener: () => void) => listeners.delete(listener),
  };
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn(() => media),
  });
  return {
    change(theme: Theme) {
      matches = theme === 'dark';
      listeners.forEach((listener) => listener());
    },
  };
}

function runThemeScript() {
  const match = /<script>([\s\S]*?)<\/script>/.exec(indexHtml);
  if (!match?.[1]) throw new Error('Inline theme script not found in index.html');
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- runs our own trusted index.html script
  const boot = new Function(match[1]) as () => void;
  boot();
}

const htmlTheme = () => document.documentElement.dataset.theme;
const storedTheme = () => localStorage.getItem(THEME_KEY);

describe('useTheme', () => {
  let system: ReturnType<typeof mockSystemTheme>;

  beforeEach(() => {
    system = mockSystemTheme('light');
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('follows the OS on a first visit and saves nothing', () => {
    system = mockSystemTheme('dark');
    runThemeScript();
    const { result } = renderHook(() => useTheme());

    expect(htmlTheme()).toBe('dark');
    expect(result.current.theme).toBe('dark');
    expect(storedTheme()).toBeNull();
  });

  it('uses a saved choice over the OS', () => {
    system = mockSystemTheme('dark');
    localStorage.setItem(THEME_KEY, 'light');
    runThemeScript();
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
  });

  it('saves only once the person picks', () => {
    runThemeScript();
    const { result } = renderHook(() => useTheme());
    expect(storedTheme()).toBeNull();

    act(() => result.current.setTheme('dark'));

    expect(storedTheme()).toBe('dark');
    expect(htmlTheme()).toBe('dark');
    expect(result.current.theme).toBe('dark');
  });

  it('follows OS changes while nothing is saved', () => {
    runThemeScript();
    const { result } = renderHook(() => useTheme());

    act(() => system.change('dark'));

    expect(result.current.theme).toBe('dark');
    expect(htmlTheme()).toBe('dark');
    expect(storedTheme()).toBeNull();
  });

  it('ignores OS changes after a pick', () => {
    runThemeScript();
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme('light'));
    act(() => system.change('dark'));

    expect(result.current.theme).toBe('light');
    expect(htmlTheme()).toBe('light');
  });

  it('toggleTheme switches the data-theme attribute and saves it', () => {
    runThemeScript();
    const { result } = renderHook(() => useTheme());
    expect(htmlTheme()).toBe('light');

    act(() => result.current.toggleTheme());
    expect(htmlTheme()).toBe('dark');
    expect(storedTheme()).toBe('dark');

    act(() => result.current.toggleTheme());
    expect(htmlTheme()).toBe('light');
    expect(storedTheme()).toBe('light');
  });

  it('keeps every component in sync', () => {
    runThemeScript();
    const first = renderHook(() => useTheme());
    const second = renderHook(() => useTheme());

    act(() => first.result.current.toggleTheme());

    expect(second.result.current.theme).toBe('dark');
  });

  it('still works when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    system = mockSystemTheme('dark');

    expect(() => runThemeScript()).not.toThrow();
    expect(htmlTheme()).toBe('dark');

    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());

    expect(htmlTheme()).toBe('light');
    expect(result.current.theme).toBe('light');
  });
});
