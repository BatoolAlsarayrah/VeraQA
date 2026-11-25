import { useParams } from 'react-router';

import { PageHeader } from '@/components/layout';
import { paths } from '@/lib';

export function ScenarioPage() {
  const { projectId = '', scenarioId = '' } = useParams();
  return (
    <PageHeader
      title={scenarioId}
      back={{ to: paths.scenarios(projectId), label: 'Test scenarios' }}
    />
  );
}
