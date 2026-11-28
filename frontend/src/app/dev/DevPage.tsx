import { useQuery } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { PageHeader } from '@/components/layout';
import { LinkButton } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { getCurrentProject, paths, sessionQuery, subscribeCurrentProject } from '@/lib';

import { AnalysisSwitcher } from './AnalysisSwitcher';
import { mockMode } from './mock';
import { MockControls } from './MockControls';
import { ResetLink } from './ResetLink';
import { RoleSwitcher } from './RoleSwitcher';
import { SignInAs } from './SignInAs';

export function DevPage() {
  const session = useQuery(sessionQuery).data;
  const current = useSyncExternalStore(subscribeCurrentProject, getCurrentProject);
  const project =
    session?.memberships.find((entry) => entry.projectId === current) ?? session?.memberships[0];

  return (
    <>
      <PageHeader
        title="Dev tools"
        lede="Development builds only. These controls change the mock API’s data, and work whether or not anyone is signed in."
        actions={<LinkButton to={paths.components}>Component gallery</LinkButton>}
      />
      {mockMode ? (
        <>
          <MockControls />
          <ResetLink />
          <SignInAs />
          {session ? (
            <>
              <RoleSwitcher session={session} />
              {project && <AnalysisSwitcher project={project} />}
            </>
          ) : (
            <Panel title="Nobody is signed in">
              <p className="text-text-2">
                Sign in as someone above to change roles and start an analysis.
              </p>
            </Panel>
          )}
        </>
      ) : (
        <Panel title="Mock API is off">
          <p className="text-text-2">
            The app is talking to the live API, so these controls would change nothing. Set
            VITE_API_MODE=mock in .env and restart the dev server to use them.
          </p>
        </Panel>
      )}
    </>
  );
}
