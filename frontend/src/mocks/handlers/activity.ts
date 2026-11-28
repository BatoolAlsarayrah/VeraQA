import type { ActivityEntry } from '@/types';

import { api } from '../api';
import type { ActivityRecord, Db } from '../db';
import { actor, inProject } from '../rules';

export function activityView(db: Db, record: ActivityRecord): ActivityEntry {
  return {
    id: record.id,
    at: record.at,
    actor: actor(db, record.actor),
    type: record.type,
    action: record.action,
    item: record.item,
    count: record.count,
  };
}

export function recent(db: Db, projectId: string) {
  return db.activity
    .filter((entry) => entry.projectId === projectId)
    .sort((a, b) => b.at.localeCompare(a.at));
}

export const activityHandlers = [
  api.get('/projects/:projectId/activity', (context) => {
    const { projectId } = inProject(context, 'manage');
    const query = context.url.searchParams;
    const personId = query.get('person');
    const type = query.get('type');
    return {
      items: recent(context.db, projectId)
        .filter(
          (entry) =>
            (!personId ||
              (personId === 'ai'
                ? entry.actor.type === 'ai'
                : entry.actor.type === 'person' && entry.actor.id === personId)) &&
            (!type || entry.type === type),
        )
        .map((entry) => activityView(context.db, entry)),
    };
  }),
];
