import { isRouteErrorResponse, useRouteError } from 'react-router';

import { PageHeader, SoloLayout } from '@/components/layout';
import { LinkButton } from '@/components/ui';
import { paths } from '@/lib';

import { NotFound } from './NotFound';

export function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;

  return (
    <SoloLayout>
      <PageHeader
        title="Something went wrong"
        lede="This page couldn’t load. Try again, or go back to your projects."
      />
      <LinkButton to={paths.projects} variant="primary" className="self-start">
        Go to your projects
      </LinkButton>
    </SoloLayout>
  );
}
