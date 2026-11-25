import { useEffect } from 'react';

import { PageHeader } from '@/components/layout';
import { LinkButton } from '@/components/ui';
import { paths } from '@/lib';

export function NotFound() {
  useEffect(() => {
    document.title = 'Page not found · VeraQA';
  }, []);

  return (
    <main id="main" className="mx-auto flex max-w-280 flex-col gap-section-gap px-4 py-10">
      <PageHeader
        title="This stop isn’t on the line"
        lede="The page you asked for doesn’t exist. Check the address, or go back to your projects."
      />
      <LinkButton to={paths.projects} variant="primary" className="self-start">
        Go to your projects
      </LinkButton>
    </main>
  );
}
