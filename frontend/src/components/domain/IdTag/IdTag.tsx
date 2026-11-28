import { Link } from 'react-router';

import { cn } from '@/lib';

type Props = {
  children: string;
  to?: string;
  className?: string;
};

export function IdTag({ children, to, className }: Props) {
  if (to) {
    return (
      <Link
        to={to}
        className={cn('text-id font-medium text-primary no-underline hover:underline', className)}
      >
        {children}
      </Link>
    );
  }

  return <span className={cn('text-id text-text-2', className)}>{children}</span>;
}
