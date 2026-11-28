import { Link } from 'react-router';

type Props = {
  project: string;
  home: string;
  page: string;
};

export function Breadcrumb({ project, home, page }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-body-sm whitespace-nowrap">
        <li className="min-w-0 truncate">
          <Link to={home} className="text-text-2 no-underline hover:underline">
            {project}
          </Link>
        </li>
        <li aria-hidden="true" className="text-text-3">
          /
        </li>
        <li aria-current="page" className="truncate font-semibold text-text">
          {page}
        </li>
      </ol>
    </nav>
  );
}
