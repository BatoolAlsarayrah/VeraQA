import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';

import { Icon, type IconName } from '@/components/domain/Icon';

import { buttonClass, type Size, type Variant } from './styles';

type Label =
  | { children: ReactNode; icon?: IconName }
  | { children?: undefined; icon: IconName; 'aria-label': string };

type Props = Omit<LinkProps, 'children' | 'className'> &
  Label & {
    variant?: Variant;
    size?: Size;
    className?: string;
  };

export function LinkButton({
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  className,
  ...rest
}: Props) {
  return (
    <Link
      {...rest}
      className={buttonClass({ variant, size, iconOnly: children === undefined, className })}
    >
      {icon && <Icon name={icon} />}
      {children}
    </Link>
  );
}
