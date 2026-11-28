import type { ActivityType, ItemEvent, NotificationTarget } from '@/types';

import type { ActivityRecord, ActorRecord, Db, EventRecord } from './db';

export function now() {
  return new Date().toISOString();
}

export function by(personId: string): ActorRecord {
  return { type: 'person', id: personId };
}

export function event(
  actor: ActorRecord,
  action: ItemEvent['action'],
  note: string | null = null,
): EventRecord {
  return { at: now(), actor, action, note };
}

export function addActivity(
  db: Db,
  entry: {
    projectId: string;
    actor: ActorRecord;
    type: ActivityType;
    action: ActivityRecord['action'];
    item: ActivityRecord['item'];
    count?: number | null;
  },
) {
  db.activity.unshift({
    id: `act-${crypto.randomUUID()}`,
    at: now(),
    count: null,
    ...entry,
  });
}

export function notify(
  db: Db,
  entry: {
    personId: string;
    projectId: string;
    title: string;
    detail?: string | null;
    actor: ActorRecord;
    target: NotificationTarget;
  },
) {
  db.notifications.unshift({
    id: `note-${crypto.randomUUID()}`,
    at: now(),
    unread: true,
    detail: null,
    ...entry,
  });
}
