import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Panel } from '@/components/ui/Panel';
import { Switch } from '@/components/ui/Switch';
import { paths } from '@/lib';

import { getFlags, resetDemo, setFlags } from './mock';

export function MockControls() {
  const navigate = useNavigate();
  const [flags, setLocal] = useState(getFlags);
  const [confirming, setConfirming] = useState(false);

  function change(next: Partial<typeof flags>) {
    setFlags(next);
    setLocal(getFlags());
  }

  return (
    <Panel title="Mock API">
      <div className="flex flex-col gap-4">
        <Switch
          label="Instant AI jobs"
          description="Analysis and generation finish straight away instead of taking 6 to 10 seconds."
          checked={flags.instantJobs}
          onChange={(event) => change({ instantJobs: event.target.checked })}
        />
        <Switch
          label="Slow network"
          description="Every answer takes 2.5 to 4 seconds, to see loading states."
          checked={flags.slowNetwork}
          onChange={(event) => change({ slowNetwork: event.target.checked })}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => change({ failNext: true })} disabled={flags.failNext}>
          Fail the next request
        </Button>
        <span role="status" className="text-body-sm text-text-2">
          {flags.failNext ? 'The next request will fail with a server error.' : ''}
        </span>
      </div>
      <div>
        <Button variant="danger" onClick={() => setConfirming(true)}>
          Reset demo data
        </Button>
      </div>
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Reset demo data?"
        confirmLabel="Reset demo data"
        variant="danger-fill"
        onConfirm={() => {
          resetDemo();
          setConfirming(false);
          setLocal(getFlags());
          void navigate(paths.projects);
        }}
      >
        Every change made in the mock goes back to the seed, and you’re signed in as Batool Hani
        again. The switches above stay as they are.
      </ConfirmDialog>
    </Panel>
  );
}
