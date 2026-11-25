import type { ReactNode } from 'react';

import { Panel } from '@/components/ui';

type Props = {
  id: string;
  title: string;
  children: ReactNode;
};

export function Section({ id, title, children }: Props) {
  return (
    <div id={id} className="scroll-mt-6">
      <Panel title={title}>{children}</Panel>
    </div>
  );
}
