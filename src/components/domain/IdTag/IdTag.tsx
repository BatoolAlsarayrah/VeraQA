import { cn } from '@/lib';

type Props = {
  children: string;
  href?: string;
  className?: string;
};

export function IdTag({ children, href, className }: Props) {
  if (href) {
    return (
      <a
        href={href}
        className={cn('text-id font-medium text-primary no-underline hover:underline', className)}
      >
        {children}
      </a>
    );
  }

  return <span className={cn('text-id text-text-2', className)}>{children}</span>;
}
