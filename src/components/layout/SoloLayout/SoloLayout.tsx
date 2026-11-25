import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Logo } from '@/components/domain/Logo';
import { paths } from '@/lib';

import { SkipLink } from '../SkipLink';

type Props = {
  children: ReactNode;
  end?: ReactNode;
  pageKey?: string;
};

export function SoloLayout({ children, end, pageKey }: Props) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg transition-theme">
      <SkipLink />
      <header className="sticky top-0 z-20 flex min-h-15 items-center gap-3 bg-rail px-4 text-on-rail focus-on-rail transition-theme tablet:px-8">
        <Link to={paths.projects} aria-label="VeraQA, your projects" className="text-on-rail">
          <Logo size={32} withName tone="ink" className="tablet:hidden" />
          <Logo size={40} withName tone="ink" className="max-tablet:hidden" />
        </Link>
        <span className="flex-1" />
        {end}
      </header>
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <div
          key={pageKey}
          className="mx-auto flex w-full max-w-280 flex-1 settle-children flex-col gap-section-gap px-4 pt-4 pb-6 tablet:px-8 tablet:pt-page-block tablet:pb-10"
        >
          {children}
        </div>
      </main>
    </div>
  );
}
