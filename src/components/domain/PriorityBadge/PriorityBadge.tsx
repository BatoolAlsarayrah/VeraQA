import { Badge, type Tone } from '@/components/ui/Badge';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

const priorities: Record<Priority, { label: string; tone: Tone }> = {
  critical: { label: 'Critical', tone: 'bad-fill' },
  high: { label: 'High', tone: 'bad' },
  medium: { label: 'Medium', tone: 'warn' },
  low: { label: 'Low', tone: 'neutral' },
};

type Props = {
  level: Priority;
  className?: string;
};

export function PriorityBadge({ level, className }: Props) {
  const { label, tone } = priorities[level];

  return (
    <Badge tone={tone} className={className}>
      {label}
    </Badge>
  );
}
