import { Link } from 'react-router';

import { paths } from '@/lib';

type Props = {
  projectId: string;
  files: string[];
  step: number;
  total: number;
  done: boolean;
  found: { requirements: number; issues: number };
};

export function AnalysisBanner({ projectId, files, step, total, done, found }: Props) {
  const subject = files.length > 1 ? `${files.length} files` : (files[0] ?? 'your file');
  const text = done
    ? `Analysis complete: ${found.requirements} requirements, ${found.issues} issues`
    : `Analyzing ${subject}, step ${step} of ${total}`;

  return (
    <div
      role="status"
      className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1 bg-ai-bg px-4 py-2 text-ai-ink transition-theme tablet:px-6 desktop:px-page-inline"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden="true"
          className="size-1.75 shrink-0 rounded-full border-[1.5px] border-ai"
        />
        <span className="text-body-strong leading-5 font-bold">{text}</span>
      </span>
      <Link
        to={done ? paths.requirements(projectId) : paths.analysis(projectId)}
        className="-mx-1.5 rounded-sm px-1.5 py-2 text-label text-primary no-underline hover:underline"
      >
        {done ? 'Review' : 'Open analysis'}
      </Link>
    </div>
  );
}
