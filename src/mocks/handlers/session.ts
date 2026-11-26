import { HttpResponse } from 'msw';

import { capabilitiesFor } from '@/lib/permissions';
import {
  ForgotPasswordInput,
  NotificationSettings,
  PasswordInput,
  ProfileInput,
  RegisterInput,
  ResetPasswordInput,
  type Session,
  SignInInput,
  type User,
} from '@/types';

import { api, created, fail, getFlags } from '../api';
import type { Db, PersonRecord } from '../db';
import { now } from '../log';
import { body, fullName, signedIn } from '../rules';

const emailDefaults: NotificationSettings['email'] = {
  'analysis-ready': true,
  'test-failed': true,
  'defect-reopened': true,
  'defect-assigned': true,
  'retest-ready': true,
  'tests-assigned': true,
};

function user(person: PersonRecord): User {
  return { id: person.id, name: fullName(person), email: person.email };
}

export function sessionOf(db: Db, person: PersonRecord): Session {
  return {
    user: user(person),
    memberships: db.memberships
      .filter((entry) => entry.personId === person.id)
      .flatMap((entry) => {
        const project = db.projects.find((record) => record.id === entry.projectId);
        if (!project) return [];
        return [
          {
            projectId: project.id,
            projectName: project.name,
            role: entry.role,
            capabilities: capabilitiesFor(entry.role),
          },
        ];
      }),
  };
}

function byEmail(db: Db, email: string) {
  return db.people.find((person) => person.email.toLowerCase() === email.toLowerCase());
}

function slug(db: Db, first: string, last: string) {
  const base = `${first}-${last}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let id = base;
  for (let n = 2; db.people.some((person) => person.id === id); n += 1) id = `${base}-${n}`;
  return id;
}

const LINK_LIFE = 60 * 60_000;

function expired() {
  return fail(410, 'link_expired', 'This reset link has expired. Ask for a new one.');
}

// Unknown, used and expired tokens all answer the same, so a token never reveals which it was.
function resetLink(db: Db, token: string) {
  const link = db.resetLink;
  if (!link || link.token !== token || link.used || getFlags().expiredLinks) throw expired();
  if (Date.now() - Date.parse(link.createdAt) > LINK_LIFE) throw expired();
  return link;
}

export const sessionHandlers = [
  api.get('/session', ({ db }) => sessionOf(db, signedIn(db))),

  api.post('/auth/sign-in', async ({ db, request }) => {
    const input = await body(request, SignInInput);
    const person = byEmail(db, input.email);
    if (person?.password !== input.password) {
      throw fail(
        422,
        'invalid_credentials',
        'That email and password don’t match. Check them, or reset your password.',
      );
    }
    db.signedIn = person.id;
    return sessionOf(db, person);
  }),

  api.post('/auth/register', async ({ db, request }) => {
    const input = await body(request, RegisterInput);
    if (byEmail(db, input.email)) {
      throw fail(422, 'validation', 'Check the highlighted fields, then try again.', {
        email: 'An account with this email already exists. Sign in instead.',
      });
    }
    const person: PersonRecord = {
      id: slug(db, input.firstName, input.lastName),
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: input.password,
    };
    db.people.push(person);
    db.signedIn = person.id;
    return created(sessionOf(db, person));
  }),

  api.post('/auth/forgot-password', async ({ db, request }) => {
    const input = await body(request, ForgotPasswordInput);
    const person = byEmail(db, input.email);
    if (person) {
      db.resetLink = {
        email: person.email,
        token: crypto.randomUUID(),
        createdAt: now(),
        used: false,
      };
    }
    return new HttpResponse(null, { status: 202 });
  }),

  api.get('/auth/reset-password/:token', ({ db, params }) => {
    resetLink(db, params.token ?? '');
  }),

  api.post('/auth/reset-password', async ({ db, request }) => {
    const input = await body(request, ResetPasswordInput);
    const link = resetLink(db, input.token);
    const person = byEmail(db, link.email);
    if (!person) throw expired();
    person.password = input.password;
    link.used = true;
    if (db.signedIn === person.id) db.signedIn = null;
  }),

  api.post('/auth/sign-out', ({ db }) => {
    db.signedIn = null;
  }),

  api.patch('/account/profile', async ({ db, request }) => {
    const me = signedIn(db);
    const input = await body(request, ProfileInput);
    const other = byEmail(db, input.email);
    if (other && other.id !== me.id) {
      throw fail(422, 'validation', 'Check the highlighted fields, then try again.', {
        email: 'Another account already uses this email.',
      });
    }
    Object.assign(me, input);
    return user(me);
  }),

  api.post('/account/password', async ({ db, request }) => {
    const me = signedIn(db);
    const input = await body(request, PasswordInput);
    if (input.current !== me.password) {
      throw fail(422, 'validation', 'Check the highlighted fields, then try again.', {
        current: 'That isn’t your current password.',
      });
    }
    me.password = input.next;
  }),

  api.get('/account/notification-settings', ({ db }) => {
    const me = signedIn(db);
    return { email: { ...emailDefaults, ...db.emailSettings[me.id] } };
  }),

  api.put('/account/notification-settings', async ({ db, request }) => {
    const me = signedIn(db);
    const input = await body(request, NotificationSettings);
    db.emailSettings[me.id] = input.email;
    return { email: { ...emailDefaults, ...input.email } };
  }),
];
