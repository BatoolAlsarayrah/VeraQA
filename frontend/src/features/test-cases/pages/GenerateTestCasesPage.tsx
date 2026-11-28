import { useParams } from 'react-router';

import { PageHeader } from '@/components/layout';
import { paths } from '@/lib';

export function GenerateTestCasesPage() {
  const { projectId = '' } = useParams();
  return (
    <PageHeader
      title="Generating test cases"
      back={{ to: paths.scenarios(projectId), label: 'Test scenarios' }}
    />
  );
}
