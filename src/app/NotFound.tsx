import { useEffect } from 'react';

import { PageHeader, SoloLayout } from '@/components/layout';
import { LinkButton } from '@/components/ui';
import { paths } from '@/lib';

export function NotFound() {
  useEffect(() => {
    document.title = 'Page not found · VeraQA';
  }, []);

  return (
    <SoloLayout>
      <PageHeader
        title="This stop isn’t on the line"
        lede="The page you asked for doesn’t exist. Check the address, or go back to your projects."
      />
      <LinkButton to={paths.projects} variant="primary" className="self-start">
        Go to your projects
      </LinkButton>
    </SoloLayout>
  );
}
