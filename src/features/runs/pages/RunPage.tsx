import { useParams } from 'react-router';

import { PageHeader } from '@/components/layout';
import { paths } from '@/lib';

export function RunPage() {
  const { projectId = '', runId = '' } = useParams();
  return (
    <PageHeader title={`Run ${runId}`} back={{ to: paths.runs(projectId), label: 'Test runs' }} />
  );
}
