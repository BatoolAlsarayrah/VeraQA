import { PageHeader } from '@/components/layout';
import { LinkButton } from '@/components/ui/Button';
import { paths } from '@/lib';

import { AnalysisSwitcher } from './AnalysisSwitcher';
import { RoleSwitcher } from './RoleSwitcher';

export function DevPage() {
  return (
    <>
      <PageHeader
        title="Dev tools"
        lede="Development builds only. These switches stand in for sign-in and the AI jobs until the mock API takes over. Choices last until you close the tab."
        actions={<LinkButton to={paths.components}>Component gallery</LinkButton>}
      />
      <RoleSwitcher />
      <AnalysisSwitcher />
    </>
  );
}
