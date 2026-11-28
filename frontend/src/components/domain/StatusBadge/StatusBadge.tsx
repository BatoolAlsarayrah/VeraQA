import { Badge } from '@/components/ui/Badge';

import { type Status, statuses } from './statuses';

type Props = {
  status: Status;
  ai?: boolean;
  className?: string;
};

export function StatusBadge({ status, ai = false, className }: Props) {
  const { label, tone } = statuses[status];
  const aiReview = ai && status === 'pending-review';

  return (
    <Badge tone={aiReview ? 'ai' : tone} className={className}>
      {label}
    </Badge>
  );
}
