import { useState } from 'react';

import { Button, EmptyState, Panel, Skeleton, TabPanel, Tabs } from '@/components/ui';

const rows = [
  '5 requirements are waiting for your decision',
  'TC-031 failed in Run 12: Lock the account after 5 consecutive failed logins',
  'BUG-004 is fixed and ready for retest',
];

export function Containers() {
  const [tab, setTab] = useState<'pending' | 'all'>('pending');

  return (
    <div className="grid gap-5 desktop:grid-cols-2">
      <Panel title="Needs your attention" list level={3}>
        {rows.map((row) => (
          <p
            key={row}
            className="border-b border-border px-4 py-3 text-body last:border-b-0 tablet:px-6"
          >
            {row}
          </p>
        ))}
      </Panel>
      <Panel
        title="Open defects by severity"
        level={3}
        actions={
          <a href="#containers" className="text-label">
            Defects
          </a>
        }
      >
        <Skeleton lines={3} />
        <Skeleton shape="circle" />
      </Panel>
      <div className="flex flex-col gap-3 desktop:col-span-2">
        <Tabs
          name="gallery"
          label="Requirements"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'pending', label: 'Pending review', count: 5 },
            { id: 'all', label: 'All', count: 26 },
          ]}
        />
        <TabPanel name="gallery" id={tab}>
          <Panel>
            {tab === 'pending' ? (
              <EmptyState
                title="Nothing pending review"
                action={<Button variant="primary">Add requirements</Button>}
              >
                Upload the SRS or type the requirements in.
              </EmptyState>
            ) : (
              <p className="text-body">26 requirements, 21 approved.</p>
            )}
          </Panel>
        </TabPanel>
      </div>
    </div>
  );
}
