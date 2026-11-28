import type { ReactNode } from 'react';

type Props = {
  label: string;
  children: ReactNode;
};

export function Row({ label, children }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-caption text-text-3">{label}</h3>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
