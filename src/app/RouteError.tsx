import { isRouteErrorResponse, useRouteError } from 'react-router';

import { PageHeader } from '@/components/layout';
import { LinkButton } from '@/components/ui';
import { paths } from '@/lib';

import { NotFound } from './NotFound';

export function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;

  return (
    <main id="main" className="mx-auto flex max-w-280 flex-col gap-section-gap px-4 py-10">
      <PageHeader
        title="Something went wrong"
        lede="This page couldn’t load. Try again, or go back to your projects."
      />
      <LinkButton to={paths.projects} variant="primary" className="self-start">
        Go to your projects
      </LinkButton>
    </main>
  );
}
