import { useTheme } from '@/hooks';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex min-h-10 items-center gap-2 rounded-control bg-surface px-4 text-body-strong text-text shadow-ledge-secondary transition-press hover:bg-subtle active:translate-y-0.5 active:shadow-ledge-secondary-pressed"
    >
      <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM40,128a88.1,88.1,0,0,1,88-88V216A88.1,88.1,0,0,1,40,128Z" />
      </svg>
      {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
    </button>
  );
}
