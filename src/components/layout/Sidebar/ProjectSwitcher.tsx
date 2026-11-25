import { Link } from 'react-router';

import { Icon } from '@/components/domain/Icon';
import { paths } from '@/lib';

export function ProjectSwitcher({ name }: { name: string }) {
  return (
    <Link
      to={paths.projects}
      aria-label={`Switch project, current project ${name}`}
      className="flex w-full items-center gap-2 rounded-control border border-rail-3 bg-rail-2 px-2.5 py-2 text-on-rail transition-[background-color] duration-150 hover:bg-rail-on"
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-caption text-on-rail-3">Project</span>
        <span className="truncate text-body-sm font-medium">{name}</span>
      </span>
      <Icon name="caret-up-down" className="text-on-rail-3" />
    </Link>
  );
}
