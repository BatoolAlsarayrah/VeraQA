import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';

import { PageHeader } from '@/components/layout';
import { Button, EmptyState, Panel, Skeleton, TabPanel, Tabs, useToast } from '@/components/ui';
import { useProject } from '@/hooks';
import { dayGroup, paths } from '@/lib';
import type { Notification } from '@/types';

import { notificationsQuery, useReadAll, useReadNotification } from '../api';
import { NotificationRow } from '../components/NotificationRow';

type Filter = 'all' | 'unread';

function byDay(items: Notification[], now: number) {
  const groups = new Map<string, Notification[]>();
  for (const item of items) {
    const label = dayGroup(item.at, now);
    groups.set(label, [...(groups.get(label) ?? []), item]);
  }
  return [...groups];
}

export function NotificationsPage() {
  const project = useProject();
  const projectId = project?.projectId ?? '';
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const notifications = useQuery({ ...notificationsQuery(projectId), enabled: Boolean(project) });
  const read = useReadNotification(projectId);
  const readAll = useReadAll(projectId);

  const items = notifications.data?.items ?? [];
  const unread = items.filter((item) => item.unread).length;
  const shown = filter === 'unread' ? items.filter((item) => item.unread) : items;
  const now = notifications.dataUpdatedAt;

  return (
    <>
      <PageHeader
        title="Notifications"
        actions={
          unread > 0 && (
            <Button
              loading={readAll.isPending}
              onClick={() =>
                readAll.mutate(undefined, { onSuccess: () => toast('All marked as read') })
              }
            >
              Mark all as read
            </Button>
          )
        }
      />
      <Tabs
        name="notifications"
        label="Show"
        tabs={[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread', count: unread },
        ]}
        value={filter}
        onChange={setFilter}
        className="tablet:self-start"
      />
      <TabPanel name="notifications" id={filter} className="flex flex-col gap-5">
        {notifications.isPending && (
          <Panel>
            <Skeleton lines={4} />
          </Panel>
        )}
        {notifications.isError && (
          <Panel>
            <p className="text-text-2">
              Notifications couldn’t load. Check your connection, then try again.
            </p>
          </Panel>
        )}
        {notifications.isSuccess && shown.length === 0 && (
          <Panel>
            <EmptyState title="You’re all caught up">
              {filter === 'unread'
                ? 'Nothing is unread.'
                : 'New activity on your work shows up here.'}
            </EmptyState>
          </Panel>
        )}
        {byDay(shown, now).map(([day, entries]) => (
          <section key={day} aria-label={day} className="flex flex-col gap-2">
            <h2 className="text-label text-text-2">{day}</h2>
            <ul className="overflow-hidden rounded-panel border border-border bg-surface transition-theme">
              {entries.map((entry) => (
                <NotificationRow
                  key={entry.id}
                  projectId={projectId}
                  notification={entry}
                  now={now}
                  onRead={(id) => read.mutate(id)}
                />
              ))}
            </ul>
          </section>
        ))}
      </TabPanel>
      <p className="text-body-sm text-text-2">
        Choose what you hear about in <Link to={paths.account}>account settings</Link>.
      </p>
    </>
  );
}
