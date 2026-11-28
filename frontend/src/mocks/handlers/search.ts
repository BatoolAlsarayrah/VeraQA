import type { Person, SearchResult } from '@/types';

import { api } from '../api';
import { can, inProject, person } from '../rules';
import { entriesFor, lastResult } from '../work';

export const searchHandlers = [
  api.get('/projects/:projectId/search', (context) => {
    const { me, member, projectId } = inProject(context);
    const { db } = context;
    const query = context.url.searchParams;
    const q = query.get('q')?.trim().toLowerCase() ?? '';
    const type = query.get('type');
    const priority = query.get('priority');
    const status = query.get('status');
    const assignee = query.get('assignee') === 'me' ? me.id : query.get('assignee');
    const workspace = can(member, 'workspace');
    const of = (id: string | null): Person | null => (id ? person(db, id) : null);
    const results: (SearchResult & { assigneeId: string | null; text: string })[] = [];

    if (workspace) {
      for (const entry of db.requirements.filter((item) => item.projectId === projectId)) {
        results.push({
          item: { type: 'requirement', id: entry.id, title: entry.title },
          status: entry.status,
          priority: entry.priority,
          assignee: of(entry.assigneeId),
          assigneeId: entry.assigneeId,
          text: entry.text,
        });
      }
      for (const entry of db.scenarios.filter((item) => item.projectId === projectId)) {
        results.push({
          item: { type: 'scenario', id: entry.id, title: entry.title },
          status: entry.status,
          priority: entry.priority,
          assignee: of(entry.assigneeId),
          assigneeId: entry.assigneeId,
          text: '',
        });
      }
      for (const entry of db.testCases.filter((item) => item.projectId === projectId)) {
        const runner = entriesFor(db, projectId, entry.id)[0]?.assigneeId ?? entry.assigneeId;
        results.push({
          item: { type: 'test-case', id: entry.id, title: entry.title },
          status: entry.status === 'approved' ? lastResult(db, projectId, entry.id) : entry.status,
          priority: entry.priority,
          assignee: of(runner),
          assigneeId: runner,
          text: '',
        });
      }
    }
    for (const entry of db.defects.filter((item) => item.projectId === projectId)) {
      if (!workspace && entry.assigneeId !== me.id) continue;
      results.push({
        item: { type: 'defect', id: entry.id, title: entry.title },
        status: entry.status,
        priority: entry.severity,
        assignee: of(entry.assigneeId),
        assigneeId: entry.assigneeId,
        text: '',
      });
    }

    return {
      items: results
        .filter(
          (entry) =>
            (!q ||
              `${entry.item.id} ${entry.item.title} ${entry.text}`.toLowerCase().includes(q)) &&
            (!type || entry.item.type === type) &&
            (!priority || entry.priority === priority) &&
            (!status || entry.status === status) &&
            (!assignee || entry.assigneeId === assignee),
        )
        .map(({ item, status: itemStatus, priority: itemPriority, assignee: itemAssignee }) => ({
          item,
          status: itemStatus,
          priority: itemPriority,
          assignee: itemAssignee,
        })),
    };
  }),
];
