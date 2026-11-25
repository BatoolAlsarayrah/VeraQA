import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';

import { Icon, type IconName } from '@/components/domain/Icon';

import { buttonClass, type Size, type Variant } from './styles';

type Label =
  | { children: ReactNode; icon?: IconName }
  | { children?: undefined; icon: IconName; 'aria-label': string };

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'children'> &
  Label & {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    disabled?: boolean;
    approved?: boolean;
  };

export function Button({
  variant = 'secondary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  approved = false,
  icon,
  children,
  className,
  onClick,
  ...rest
}: Props) {
  const iconOnly = children === undefined;
  const blocked = loading || (disabled && type !== 'submit');

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (blocked) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return (
    <button
      {...rest}
      type={type}
      aria-disabled={disabled || loading || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
      className={buttonClass({ variant, size, iconOnly, disabled, className })}
    >
      <span className={loading ? 'invisible inline-flex items-center gap-2' : 'contents'}>
        {approved ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="24"
              className="animate-draw"
            />
          </svg>
        ) : (
          icon && <Icon name={icon} />
        )}
        {approved ? 'Approved' : children}
      </span>
      {loading && (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="absolute animate-spin"
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" opacity=".3" />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
