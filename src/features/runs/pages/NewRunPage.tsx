import { useParams } from 'react-router';

import { PageHeader } from '@/components/layout';
import { paths } from '@/lib';

export function NewRunPage() {
  const { projectId = '' } = useParams();
  return (
    <PageHeader title="New test run" back={{ to: paths.runs(projectId), label: 'Test runs' }} />
  );
}
