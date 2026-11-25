import { useParams } from 'react-router';

import { PageHeader } from '@/components/layout';
import { paths } from '@/lib';

export function DefectPage() {
  const { projectId = '', defectId = '' } = useParams();
  return <PageHeader title={defectId} back={{ to: paths.defects(projectId), label: 'Defects' }} />;
}
