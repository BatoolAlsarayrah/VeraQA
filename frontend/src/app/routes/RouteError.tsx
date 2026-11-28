import { isRouteErrorResponse, useRouteError } from 'react-router';

import { PageHeader, SoloLayout } from '@/components/layout';
import { Button, LinkButton } from '@/components/ui';
import { ContractError, HttpError, NetworkError, paths } from '@/lib';

import { NotFound } from './NotFound';

function describe(error: unknown) {
  if (error instanceof ContractError) {
    return {
      title: 'This page got data it can’t show',
      lede: 'The server sent something this version of VeraQA doesn’t expect. Reload to try again. If it keeps happening, send the details below to the backend team.',
      detail: `${error.endpoint} · ${error.field}`,
    };
  }
  if (error instanceof NetworkError) {
    return { title: 'VeraQA can’t reach the server', lede: error.message, detail: null };
  }
  if (error instanceof HttpError) {
    return { title: 'This page couldn’t load', lede: error.message, detail: null };
  }
  return {
    title: 'Something went wrong',
    lede: 'This page couldn’t load. Try again, or go back to your projects.',
    detail: null,
  };
}

export function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  if (error instanceof HttpError && error.status === 404) return <NotFound />;

  const { title, lede, detail } = describe(error);

  return (
    <SoloLayout>
      <PageHeader title={title} lede={lede} />
      {detail && (
        <p className="self-start rounded-control bg-subtle px-3 py-2 text-body-sm break-all text-text-2">
          {detail}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={() => window.location.reload()}>
          Reload page
        </Button>
        <LinkButton to={paths.projects}>Go to your projects</LinkButton>
      </div>
    </SoloLayout>
  );
}
