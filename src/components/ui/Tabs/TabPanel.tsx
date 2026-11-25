import type { ReactNode } from 'react';

import { panelId, tabId } from './ids';

type Props = {
  name: string;
  id: string;
  children: ReactNode;
  className?: string;
};

export function TabPanel({ name, id, children, className }: Props) {
  return (
    <div
      role="tabpanel"
      id={panelId(name, id)}
      aria-labelledby={tabId(name, id)}
      tabIndex={0}
      className={className}
    >
      {children}
    </div>
  );
}
