import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';

import { closeDefect, defectStatus } from './mock';

const project = 'e-commerce-portal-v2';

export function DemoStates() {
  const [closed, setClosed] = useState(() => defectStatus(project, 'BUG-003') === 'closed');

  return (
    <Panel title="Demo states">
      <p className="text-body-sm text-text-2">
        Close BUG-003 in E-Commerce Portal v2 as if its retest passed. TC-040, which it blocked,
        moves to Batool Hani’s Ready to run again, and she gets a notification.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={closed}
          onClick={() => {
            closeDefect(project, 'BUG-003');
            setClosed(true);
          }}
        >
          Close BUG-003
        </Button>
        <span role="status" className="text-body-sm text-text-2">
          {closed ? 'BUG-003 is closed. Reset demo data to undo it.' : ''}
        </span>
      </div>
    </Panel>
  );
}
