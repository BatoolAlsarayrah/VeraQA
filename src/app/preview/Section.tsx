import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
};

export function Section({ title, children }: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border bg-surface px-4 py-4 transition-theme tablet:px-panel-inline tablet:py-panel-block">
      <h2 className="text-title">{title}</h2>
      {children}
    </section>
  );
}
