import { Link } from 'react-router';

import { SeverityChart } from '@/components/domain';
import { Panel } from '@/components/ui';
import { paths } from '@/lib';
import type { BySeverity } from '@/types';

type Props = { projectId: string; defects: BySeverity };

export function SeverityPanel({ projectId, defects }: Props) {
  const open = defects.critical + defects.high + defects.medium + defects.low;

  return (
    <Panel
      title="Open defects by severity"
      actions={
        <Link to={paths.defects(projectId)} className="text-label no-underline hover:underline">
          Defects
        </Link>
      }
    >
      {open ? (
        <SeverityChart caption="Open defects by severity" counts={defects} />
      ) : (
        <p className="text-text-2">No open defects.</p>
      )}
    </Panel>
  );
}
