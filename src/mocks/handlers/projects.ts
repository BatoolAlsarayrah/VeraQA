import {
  DeleteProjectInput,
  type Invitation,
  type Project,
  ProjectInput,
  type Settings,
  SettingsInput,
  TransferInput,
} from '@/types';

import { api, created, fail } from '../api';
import type { Db, ProjectRecord } from '../db';
import { body, can, found, inProject, person, signedIn } from '../rules';
import { isOpen, workCount } from '../work';

function view(db: Db, project: ProjectRecord, personId: string): Project {
  const role = db.memberships.find(
    (entry) => entry.projectId === project.id && entry.personId === personId,
  )?.role;
  if (!role) throw new Error(`${personId} isn’t in ${project.id}`);
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    role,
    stage: project.stage,
    solo: project.solo,
  };
}

function settingsOf(db: Db, project: ProjectRecord): Settings {
  const manager = db.memberships.find(
    (entry) => entry.projectId === project.id && entry.role === 'project-manager',
  );
  if (!manager) throw new Error(`${project.id} has no project manager`);
  return {
    name: project.name,
    description: project.description,
    prefixes: { requirement: 'REQ', scenario: 'SC', testCase: 'TC', defect: 'BUG' },
    projectManager: person(db, manager.personId),
    ...project.settings,
  };
}

function projectRecord(db: Db, projectId: string) {
  return found(
    db.projects.find((entry) => entry.id === projectId),
    'That project',
  );
}

function slug(db: Db, name: string) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'project';
  let id = base;
  for (let n = 2; db.projects.some((project) => project.id === id); n += 1) id = `${base}-${n}`;
  return id;
}

const perProject = [
  'memberships',
  'invitations',
  'files',
  'requirements',
  'scenarios',
  'testCases',
  'runs',
  'entries',
  'defects',
  'notifications',
  'activity',
  'jobs',
] as const;

function invitationView(db: Db, invitation: Db['invitations'][number]): Invitation {
  const project = projectRecord(db, invitation.projectId);
  return {
    id: invitation.id,
    project: { id: project.id, name: project.name, description: project.description },
    role: invitation.role,
    invitedBy: person(db, invitation.invitedBy),
    at: invitation.at,
  };
}

function myInvitation(db: Db, id: string) {
  const me = signedIn(db);
  const invitation = db.invitations.find(
    (entry) => entry.id === id && entry.email.toLowerCase() === me.email.toLowerCase(),
  );
  return { me, invitation: found(invitation, 'That invitation') };
}

export const projectHandlers = [
  api.get('/projects', ({ db }) => {
    const me = signedIn(db);
    const ids = new Set(
      db.memberships.filter((entry) => entry.personId === me.id).map((entry) => entry.projectId),
    );
    return {
      items: db.projects
        .filter((project) => ids.has(project.id))
        .map((project) => view(db, project, me.id)),
    };
  }),

  api.post('/projects', async ({ db, request }) => {
    const me = signedIn(db);
    const input = await body(request, ProjectInput);
    const project: ProjectRecord = {
      id: slug(db, input.name),
      name: input.name,
      description: input.description,
      solo: input.team === 'solo',
      stage: 'getting-started',
      createdAt: new Date().toISOString(),
      settings: {
        targetDate: null,
        environments: ['Staging, Chrome 130'],
        rules: { bulkApproval: true, rejectReason: true, engineersReportDefects: true },
        ai: { flagVague: true, flagMissing: true, flagContradictions: true, suggestRewrites: true },
        language: 'en',
      },
    };
    db.projects.push(project);
    db.memberships.push({ projectId: project.id, personId: me.id, role: 'project-manager' });
    return created(view(db, project, me.id));
  }),

  api.get('/projects/:projectId/counts', (context) => {
    const { me, member, projectId } = inProject(context);
    const { db } = context;
    const defects = db.defects.filter(
      (defect) =>
        defect.projectId === projectId &&
        isOpen(defect) &&
        (can(member, 'workspace') || defect.assigneeId === me.id),
    );
    return {
      myWork: workCount(db, projectId, me.id),
      pendingReview: can(member, 'workspace')
        ? db.requirements.filter(
            (entry) => entry.projectId === projectId && entry.status === 'pending-review',
          ).length
        : 0,
      openDefects: defects.length,
    };
  }),

  api.get('/invitations', ({ db }) => {
    const me = signedIn(db);
    return {
      items: db.invitations
        .filter((entry) => entry.email.toLowerCase() === me.email.toLowerCase())
        .map((entry) => invitationView(db, entry)),
    };
  }),

  api.post('/invitations/:id/accept', ({ db, params }) => {
    const { me, invitation } = myInvitation(db, params.id ?? '');
    db.invitations = db.invitations.filter((entry) => entry.id !== invitation.id);
    db.memberships.push({
      projectId: invitation.projectId,
      personId: me.id,
      role: invitation.role,
    });
    db.notifications.unshift({
      id: `note-${crypto.randomUUID()}`,
      personId: invitation.invitedBy,
      projectId: invitation.projectId,
      title: `${person(db, me.id).name} accepted your invite`,
      detail: null,
      at: new Date().toISOString(),
      unread: true,
      actor: { type: 'person', id: me.id },
      target: { type: 'members', id: null },
    });
    return view(db, projectRecord(db, invitation.projectId), me.id);
  }),

  api.post('/invitations/:id/decline', ({ db, params }) => {
    const { invitation } = myInvitation(db, params.id ?? '');
    db.invitations = db.invitations.filter((entry) => entry.id !== invitation.id);
  }),

  api.get('/projects/:projectId/settings', (context) => {
    const { projectId } = inProject(context, 'manage');
    return settingsOf(context.db, projectRecord(context.db, projectId));
  }),

  api.patch('/projects/:projectId/settings', async (context) => {
    const { projectId } = inProject(context, 'manage');
    const input = await body(context.request, SettingsInput);
    const project = projectRecord(context.db, projectId);
    const { name, description, ...settings } = input;
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    project.settings = { ...project.settings, ...settings };
    return settingsOf(context.db, project);
  }),

  api.post('/projects/:projectId/transfer', async (context) => {
    const { me, projectId } = inProject(context, 'owner');
    const input = await body(context.request, TransferInput);
    const { db } = context;
    const next = db.memberships.find(
      (entry) => entry.projectId === projectId && entry.personId === input.memberId,
    );
    if (!next || next.personId === me.id) {
      throw fail(422, 'validation', 'Check the highlighted fields, then try again.', {
        memberId: 'Choose someone else who is already in this project.',
      });
    }
    const current = db.memberships.find(
      (entry) => entry.projectId === projectId && entry.personId === me.id,
    );
    next.role = 'project-manager';
    if (current) current.role = 'qa-lead';
  }),

  api.delete('/projects/:projectId', async (context) => {
    const { projectId } = inProject(context, 'owner');
    const input = await body(context.request, DeleteProjectInput);
    const { db } = context;
    const project = projectRecord(db, projectId);
    if (input.confirmName !== project.name) {
      throw fail(422, 'validation', 'Check the highlighted fields, then try again.', {
        confirmName: 'Type the project name exactly as it’s shown.',
      });
    }
    db.projects = db.projects.filter((entry) => entry.id !== projectId);
    for (const key of perProject) {
      const kept = (db[key] as { projectId: string }[]).filter(
        (entry) => entry.projectId !== projectId,
      );
      Object.assign(db, { [key]: kept });
    }
  }),
];
