import { Icon } from '@/components/domain/Icon';
import { useTheme } from '@/hooks';
import { cn } from '@/lib';

export function ThemeButton({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={cn(
        'grid size-9 shrink-0 cursor-pointer place-items-center rounded-sm text-text-2 transition-[background-color,color] duration-150 hover:bg-subtle hover:text-text',
        className,
      )}
    >
      <Icon
        name="circle-half"
        className={cn('transition-transform duration-500 ease-standard', dark && 'rotate-180')}
      />
    </button>
  );
}
