import { Link } from 'react-router';

import { stageLabels, StageLine } from '@/components/domain';
import { Badge } from '@/components/ui';
import { useSession } from '@/hooks';
import { capabilitiesFor, homePath, roleLabels } from '@/lib';
import type { Project } from '@/types';

export function ProjectList({ projects }: { projects: Project[] }) {
  const session = useSession();
  const home = (project: Project) => {
    const membership = session.memberships.find((entry) => entry.projectId === project.id);
    return homePath(project.id, membership?.capabilities ?? capabilitiesFor(project.role));
  };

  return (
    <ul
      aria-label="Projects"
      className="overflow-hidden rounded-panel border border-border bg-surface transition-theme tablet:grid tablet:grid-cols-[minmax(0,1.3fr)_max-content_minmax(6rem,1fr)_max-content]"
    >
      {projects.map((project) => (
        <li
          key={project.id}
          className="border-t border-border first:border-t-0 tablet:col-span-full tablet:grid tablet:grid-cols-subgrid"
        >
          <Link
            to={home(project)}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 px-4 py-3 text-text no-underline transition-colors hover:bg-subtle tablet:col-span-full tablet:min-h-19 tablet:grid-cols-subgrid tablet:gap-x-6 tablet:px-6"
          >
            <span className="min-w-0">
              <span className="block text-title">{project.name}</span>
              <span className="block text-body-sm text-text-2">{project.description}</span>
            </span>
            <Badge className="justify-self-end tablet:justify-self-start">
              {roleLabels[project.role]}
            </Badge>
            <StageLine stage={project.stage} className="max-tablet:hidden" />
            <span className="text-body-sm text-text-2 max-tablet:col-span-full">
              {stageLabels[project.stage]}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
