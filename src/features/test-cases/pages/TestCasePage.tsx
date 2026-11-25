import { useParams } from 'react-router';

import { PageHeader, usePhoneDetail } from '@/components/layout';
import { paths } from '@/lib';

export function TestCasePage() {
  const { projectId = '', testCaseId = '' } = useParams();
  usePhoneDetail(true);
  return (
    <PageHeader title={testCaseId} back={{ to: paths.testCases(projectId), label: 'Test cases' }} />
  );
}
