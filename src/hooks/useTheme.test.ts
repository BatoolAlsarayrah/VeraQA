import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import indexHtml from '../../index.html?raw';
import { type Theme, THEME_STORAGE_KEY, useTheme } from './useTheme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Stands in for the OS appearance setting, which jsdom doesn't have. */
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

/** Runs the real inline theme script from index.html, as the browser does before first paint. */
function runBootScript() {
  const match = /<script>([\s\S]*?)<\/script>/.exec(indexHtml);
  if (!match?.[1]) throw new Error('Inline theme script not found in index.html');
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- runs our own trusted index.html script
  const boot = new Function(match[1]) as () => void;
  boot();
}

const attribute = () => document.documentElement.dataset.theme;
const saved = () => localStorage.getItem(THEME_STORAGE_KEY);

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
    runBootScript();
    const { result } = renderHook(() => useTheme());

    expect(attribute()).toBe('dark');
    expect(result.current.theme).toBe('dark');
    expect(saved()).toBeNull();
  });

  it('uses a saved choice over the OS', () => {
    system = mockSystemTheme('dark');
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    runBootScript();
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
  });

  it('saves only once the person picks', () => {
    runBootScript();
    const { result } = renderHook(() => useTheme());
    expect(saved()).toBeNull();

    act(() => result.current.setTheme('dark'));

    expect(saved()).toBe('dark');
    expect(attribute()).toBe('dark');
    expect(result.current.theme).toBe('dark');
  });

  it('follows OS changes while nothing is saved', () => {
    runBootScript();
    const { result } = renderHook(() => useTheme());

    act(() => system.change('dark'));

    expect(result.current.theme).toBe('dark');
    expect(attribute()).toBe('dark');
    expect(saved()).toBeNull();
  });

  it('ignores OS changes after a pick', () => {
    runBootScript();
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme('light'));
    act(() => system.change('dark'));

    expect(result.current.theme).toBe('light');
    expect(attribute()).toBe('light');
  });

  it('toggleTheme switches the data-theme attribute and saves it', () => {
    runBootScript();
    const { result } = renderHook(() => useTheme());
    expect(attribute()).toBe('light');

    act(() => result.current.toggleTheme());
    expect(attribute()).toBe('dark');
    expect(saved()).toBe('dark');

    act(() => result.current.toggleTheme());
    expect(attribute()).toBe('light');
    expect(saved()).toBe('light');
  });

  it('keeps every component in sync', () => {
    runBootScript();
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

    expect(() => runBootScript()).not.toThrow();
    expect(attribute()).toBe('dark');

    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());

    expect(attribute()).toBe('light');
    expect(result.current.theme).toBe('light');
  });
});
