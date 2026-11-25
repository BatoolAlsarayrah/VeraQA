import { type ReactNode, useState } from 'react';

import { cn } from '@/lib';

import { SkipLink } from '../SkipLink';
import { DetailContext } from './detail';

type Props = {
  children: ReactNode;
  sidebar?: ReactNode;
  top?: ReactNode;
  bottom?: ReactNode;
  narrow?: boolean;
  pageKey?: string;
};

export function AppShell({ children, sidebar, top, bottom, narrow = false, pageKey }: Props) {
  const [detail, setDetail] = useState(false);

  return (
    <DetailContext value={setDetail}>
      <div
        className="group min-h-dvh bg-bg transition-theme tablet:grid tablet:grid-cols-[auto_minmax(0,1fr)]"
        data-shell
        data-detail={detail || undefined}
      >
        <SkipLink />
        {sidebar}
        <div className="flex min-h-dvh min-w-0 flex-col">
          {top}
          <main
            id="main"
            tabIndex={-1}
            className="flex flex-1 flex-col pb-[calc(5rem+env(safe-area-inset-bottom))] outline-none group-data-detail:pb-0 tablet:pb-0"
          >
            <div
              key={pageKey}
              className={cn(
                'flex w-full flex-1 settle-children flex-col gap-section-gap px-4 pt-4 pb-6 tablet:px-6 tablet:pb-10 desktop:px-page-inline',
                narrow
                  ? 'mx-auto max-w-200 tablet:pt-10'
                  : 'tablet:pt-page-block wide:mx-auto wide:max-w-380',
              )}
            >
              {children}
            </div>
          </main>
          {bottom}
        </div>
      </div>
    </DetailContext>
  );
}
