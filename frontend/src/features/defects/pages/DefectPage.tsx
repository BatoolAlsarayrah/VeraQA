import { useParams } from 'react-router';

import { PageHeader } from '@/components/layout';
import { useCan } from '@/hooks';
import { paths } from '@/lib';

export function DefectPage() {
  const { projectId = '', defectId = '' } = useParams();
  const workspace = useCan('workspace');
  return (
    <PageHeader
      title={defectId}
      back={{ to: paths.defects(projectId), label: workspace ? 'Defects' : 'Your defects' }}
    />
  );
}
