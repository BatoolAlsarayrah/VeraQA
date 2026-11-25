import { useParams } from 'react-router';

import { PageHeader } from '@/components/layout';
import { paths } from '@/lib';

export function RunTestPage() {
  const { projectId = '', runId = '', testCaseId = '' } = useParams();
  return (
    <PageHeader
      title={`Run a test · ${testCaseId}`}
      back={{ to: paths.run(projectId, runId), label: `Run ${runId}` }}
    />
  );
}
