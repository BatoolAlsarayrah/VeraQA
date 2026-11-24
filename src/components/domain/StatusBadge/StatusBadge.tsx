import { Badge, type Tone } from '@/components/ui/Badge';

export type Status =
  | 'pending-review'
  | 'ai-draft'
  | 'approved'
  | 'rejected'
  | 'not-run'
  | 'passed'
  | 'failed'
  | 'blocked'
  | 'open'
  | 'in-progress'
  | 'fixed'
  | 'retest'
  | 'reopened'
  | 'closed'
  | 'invalid';

const statuses: Record<Status, { label: string; tone: Tone }> = {
  'pending-review': { label: 'Pending review', tone: 'neutral' },
  'ai-draft': { label: 'AI draft', tone: 'ai' },
  approved: { label: 'Approved', tone: 'ok' },
  rejected: { label: 'Rejected', tone: 'bad' },
  'not-run': { label: 'Not run', tone: 'neutral' },
  passed: { label: 'Passed', tone: 'ok' },
  failed: { label: 'Failed', tone: 'bad' },
  blocked: { label: 'Blocked', tone: 'warn' },
  open: { label: 'Open', tone: 'bad' },
  'in-progress': { label: 'In progress', tone: 'progress' },
  fixed: { label: 'Fixed', tone: 'ok' },
  retest: { label: 'Retest', tone: 'warn' },
  reopened: { label: 'Reopened', tone: 'bad-fill' },
  closed: { label: 'Closed', tone: 'neutral' },
  invalid: { label: 'Invalid', tone: 'neutral' },
};

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
