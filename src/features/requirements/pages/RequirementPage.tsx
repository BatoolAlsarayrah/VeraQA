import { useParams } from 'react-router';

import { PageHeader } from '@/components/layout';
import { paths } from '@/lib';

export function RequirementPage() {
  const { projectId = '', requirementId = '' } = useParams();
  return (
    <PageHeader
      title={requirementId}
      back={{ to: paths.requirements(projectId), label: 'Requirements' }}
    />
  );
}
