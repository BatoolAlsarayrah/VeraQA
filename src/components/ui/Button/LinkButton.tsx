import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { Icon, type IconName } from '@/components/domain/Icon';

import { buttonClass, type Size, type Variant } from './styles';

type Label =
  | { children: ReactNode; icon?: IconName }
  | { children?: undefined; icon: IconName; 'aria-label': string };

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> &
  Label & {
    href: string;
    variant?: Variant;
    size?: Size;
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
    <a
      {...rest}
      className={buttonClass({ variant, size, iconOnly: children === undefined, className })}
    >
      {icon && <Icon name={icon} />}
      {children}
    </a>
  );
}
