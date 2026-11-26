import { InviteInput, type Member, RoleInput } from '@/types';

import { api, fail } from '../api';
import type { Db } from '../db';
import { body, can, found, fullName, inProject } from '../rules';

export function workload(db: Db, projectId: string, personId: string, role: Member['role']) {
  if (role === 'developer') {
    const mine = db.defects.filter(
      (defect) => defect.projectId === projectId && defect.assigneeId === personId,
    );
    return {
      assigned: mine.length,
      done: mine.filter((defect) =>
        ['fixed', 'retest', 'closed', 'invalid'].includes(defect.status),
      ).length,
      unit: 'defects' as const,
    };
  }
  const active = new Set(
    db.runs
      .filter((run) => run.projectId === projectId && run.status === 'active')
      .map((run) => run.number),
  );
  const tests = db.entries.filter(
    (entry) =>
      entry.projectId === projectId && active.has(entry.run) && entry.assigneeId === personId,
  );
  const reviews = [...db.requirements, ...db.scenarios, ...db.testCases].filter(
    (entry) => entry.projectId === projectId && entry.assigneeId === personId,
  );
  return {
    assigned: tests.length + reviews.length,
    done:
      tests.filter((entry) => entry.result !== 'not-run').length +
      reviews.filter((entry) => entry.status !== 'pending-review').length,
    unit: 'items' as const,
  };
}

export const memberHandlers = [
  api.get('/projects/:projectId/members', (context) => {
    const { member, projectId } = inProject(context, 'workspace');
    const { db } = context;
    const full = can(member, 'manage');
    const people: Member[] = db.memberships
      .filter((entry) => entry.projectId === projectId)
      .map((entry) => {
        const record = found(
          db.people.find((person) => person.id === entry.personId),
          'That person',
        );
        return {
          id: record.id,
          name: fullName(record),
          role: entry.role,
          ...(full && {
            email: record.email,
            status: 'active' as const,
            workload: workload(db, projectId, record.id, entry.role),
          }),
        };
      });
    const invited: Member[] = full
      ? db.invitations
          .filter((entry) => entry.projectId === projectId)
          .map((entry) => ({
            id: entry.id,
            name: entry.email,
            role: entry.role,
            email: entry.email,
            status: 'invited' as const,
          }))
      : [];
    return { items: [...people, ...invited] };
  }),

  api.post('/projects/:projectId/invitations', async (context) => {
    const { me, projectId } = inProject(context, 'manage');
    const input = await body(context.request, InviteInput);
    const { db } = context;
    const memberEmails = db.memberships
      .filter((entry) => entry.projectId === projectId)
      .flatMap((entry) => db.people.filter((person) => person.id === entry.personId))
      .map((person) => person.email.toLowerCase());
    const already = input.emails.find((email) => memberEmails.includes(email.toLowerCase()));
    if (already) {
      throw fail(422, 'validation', 'Check the highlighted fields, then try again.', {
        emails: `${already} is already in this project.`,
      });
    }
    for (const email of input.emails) {
      if (db.invitations.some((entry) => entry.projectId === projectId && entry.email === email)) {
        continue;
      }
      db.invitations.push({
        id: `inv-${crypto.randomUUID()}`,
        projectId,
        email,
        role: input.role,
        invitedBy: me.id,
        at: new Date().toISOString(),
      });
    }
  }),

  api.patch('/projects/:projectId/members/:memberId', async (context) => {
    const { me, projectId } = inProject(context, 'manage');
    const input = await body(context.request, RoleInput);
    const { db, params } = context;
    const target = found(
      db.memberships.find(
        (entry) => entry.projectId === projectId && entry.personId === params.memberId,
      ),
      'That member',
    );
    if (target.role === 'project-manager') {
      throw fail(
        409,
        'conflict',
        'The project manager’s role changes only through Change project manager in Project settings.',
      );
    }
    if (target.personId === me.id) {
      throw fail(409, 'conflict', 'You can’t change your own role. Ask the project manager.');
    }
    target.role = input.role;
  }),
];
