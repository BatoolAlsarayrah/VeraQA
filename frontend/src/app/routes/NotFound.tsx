import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useParams } from 'react-router';

import { LinkButton } from '@/components/ui';
import { getCurrentProject, homePath, paths, sessionQuery } from '@/lib';

import { BrokenLine } from './BrokenLine';

function useWayBack() {
  const session = useQuery(sessionQuery);
  const projectId = useParams().projectId ?? getCurrentProject();

  if (session.isPending) return null;
  if (!session.data) return [{ label: 'Sign in', to: paths.signin }];

  const membership = session.data.memberships.find((entry) => entry.projectId === projectId);
  if (!membership) return [{ label: 'Your projects', to: paths.projects }];

  const home = homePath(membership.projectId, membership.capabilities);
  return [
    {
      label: membership.capabilities.includes('workspace')
        ? 'Go to dashboard'
        : 'Go to your defects',
      to: home,
    },
    { label: 'Your projects', to: paths.projects },
  ];
}

export function NotFound() {
  const links = useWayBack();

  // Not found also renders from the root error boundary, where Root (which sets titles) is gone.
  useEffect(() => {
    document.title = 'Page not found · VeraQA';
  }, []);

  return (
    <main
      id="main"
      className="flex min-h-dvh flex-col items-center justify-center bg-rail px-4 py-10 text-center text-on-rail focus-on-rail transition-theme"
    >
      <BrokenLine className="w-full max-w-108" />
      <h1 className="mt-7 text-display-sm text-balance tablet:text-display-md">
        This stop isn’t on the line
      </h1>
      <p className="mt-5 max-w-92 text-pretty text-on-rail-2">
        The link may be old, or the item it pointed to was deleted. If someone sent it to you, ask
        them for a new one.
      </p>
      <div className="mt-6 flex min-h-11 flex-wrap justify-center gap-3">
        {links?.map((link, index) => (
          <LinkButton
            key={link.to}
            to={link.to}
            size="lg"
            variant={index === 0 ? 'primary' : 'secondary'}
          >
            {link.label}
          </LinkButton>
        ))}
      </div>
    </main>
  );
}
