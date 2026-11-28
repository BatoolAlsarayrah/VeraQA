import { useParams } from 'react-router';

import { PageHeader } from '@/components/layout';
import { paths } from '@/lib';

export function AnalysisPage() {
  const { projectId = '' } = useParams();
  return (
    <PageHeader
      title="AI analysis"
      back={{ to: paths.requirements(projectId), label: 'Requirements' }}
    />
  );
}
