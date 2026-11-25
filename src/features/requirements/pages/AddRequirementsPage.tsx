import { useParams } from 'react-router';

import { PageHeader } from '@/components/layout';
import { paths } from '@/lib';

export function AddRequirementsPage() {
  const { projectId = '' } = useParams();
  return (
    <PageHeader
      title="Add requirements"
      back={{ to: paths.requirements(projectId), label: 'Requirements' }}
    />
  );
}
