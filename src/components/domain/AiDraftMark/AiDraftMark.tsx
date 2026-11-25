import { cn } from '@/lib';

type Props = {
  label?: boolean;
  className?: string;
};

export function AiDraftMark({ label = false, className }: Props) {
  const ring = (
    <span aria-hidden="true" className="size-1.75 shrink-0 rounded-full border-[1.5px] border-ai" />
  );

  if (!label) return <span className={cn('inline-flex', className)}>{ring}</span>;

  return (
    <span className={cn('inline-flex items-center gap-1.25 text-badge text-ai-ink', className)}>
      {ring}
      AI draft
    </span>
  );
}
