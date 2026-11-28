import type { ReactNode } from 'react';

import { Logo } from '@/components/domain/Logo';

import { TraceDrawing } from './TraceDrawing';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] bg-surface transition-theme tablet:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] tablet:grid-rows-1">
      <div className="flex flex-col overflow-hidden bg-rail px-4 pt-[calc(1.75rem+env(safe-area-inset-top))] pb-8 text-on-rail focus-on-rail transition-theme tablet:px-14 tablet:py-10">
        <Logo size={40} withName tone="ink" />
        <div className="mt-4 flex flex-col tablet:my-auto tablet:py-8">
          <p className="text-display-sm text-balance tablet:text-display">Ship what's true.</p>
          <p className="mt-3 max-w-130 text-body-lg font-medium text-pretty text-on-rail-2 tablet:mt-4 tablet:text-statement tablet:font-medium">
            From SRS to the last defect, every requirement is verified and every bug traces back to
            its source.
          </p>
          <TraceDrawing className="mt-16 max-w-172 max-tablet:hidden" />
        </div>
      </div>
      <main
        id="main"
        className="flex justify-center px-4 pt-7 pb-[calc(1.75rem+env(safe-area-inset-bottom))] tablet:px-6 tablet:py-8"
      >
        <div className="my-auto flex w-full max-w-95 flex-col gap-4">{children}</div>
      </main>
    </div>
  );
}
