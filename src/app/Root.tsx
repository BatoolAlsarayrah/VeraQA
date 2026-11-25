import { useEffect } from 'react';
import { Outlet, type Params, ScrollRestoration, useMatches } from 'react-router';

export type Handle = {
  title: string | ((params: Params) => string);
};

function isHandle(value: unknown): value is Handle {
  return typeof value === 'object' && value !== null && 'title' in value;
}

export function Root() {
  const matches = useMatches();
  const match = matches.findLast((entry) => isHandle(entry.handle));
  const handle = match?.handle as Handle | undefined;
  const title = handle
    ? typeof handle.title === 'function'
      ? handle.title(match?.params ?? {})
      : handle.title
    : undefined;

  useEffect(() => {
    document.title = title ? `${title} · VeraQA` : 'VeraQA';
  }, [title]);

  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
