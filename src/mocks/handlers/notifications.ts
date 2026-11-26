import { api } from '../api';
import { actor, found, membership, signedIn } from '../rules';

export const notificationHandlers = [
  api.get('/notifications', ({ db, url }) => {
    const me = signedIn(db);
    const projectId = url.searchParams.get('projectId');
    const unread = url.searchParams.get('unread') === 'true';
    if (projectId) membership(db, me.id, projectId);
    return {
      items: db.notifications
        .filter(
          (entry) =>
            entry.personId === me.id &&
            (!projectId || entry.projectId === projectId) &&
            (!unread || entry.unread),
        )
        .sort((a, b) => b.at.localeCompare(a.at))
        .map((entry) => ({
          id: entry.id,
          projectId: entry.projectId,
          title: entry.title,
          detail: entry.detail,
          at: entry.at,
          unread: entry.unread,
          actor: actor(db, entry.actor),
          target: entry.target,
        })),
    };
  }),

  api.post('/notifications/read-all', ({ db, url }) => {
    const me = signedIn(db);
    const projectId = url.searchParams.get('projectId');
    if (projectId) membership(db, me.id, projectId);
    for (const entry of db.notifications) {
      if (entry.personId === me.id && (!projectId || entry.projectId === projectId)) {
        entry.unread = false;
      }
    }
  }),

  api.post('/notifications/:id/read', ({ db, params }) => {
    const me = signedIn(db);
    const entry = found(
      db.notifications.find((note) => note.id === params.id && note.personId === me.id),
      'That notification',
    );
    entry.unread = false;
  }),
];
