import { Icon } from '@/components/domain/Icon';
import { cn } from '@/lib';

type Props = {
  message: string | null;
  className?: string;
};

export function FormError({ message, className }: Props) {
  return (
    <div role="alert" className={cn(!message && 'hidden', className)}>
      {message && (
        <p className="flex items-start gap-2 rounded-sm border border-bad-border bg-bad-bg px-3 py-2 text-body-sm text-bad">
          <Icon name="warning" size={16} className="mt-0.5" />
          {message}
        </p>
      )}
    </div>
  );
}
