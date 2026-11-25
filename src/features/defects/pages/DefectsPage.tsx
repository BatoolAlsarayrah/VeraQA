import { PageHeader } from '@/components/layout';
import { useCan } from '@/hooks';

export function DefectsPage() {
  const workspace = useCan('workspace');
  return <PageHeader title={workspace ? 'Defects' : 'Your defects'} />;
}
