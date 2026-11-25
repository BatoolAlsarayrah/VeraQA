import { useParams } from 'react-router';

import { PageHeader } from '@/components/layout';
import { paths } from '@/lib';

export function GenerateScenariosPage() {
  const { projectId = '' } = useParams();
  return (
    <PageHeader
      title="Generating test scenarios"
      back={{ to: paths.requirements(projectId), label: 'Requirements' }}
    />
  );
}
