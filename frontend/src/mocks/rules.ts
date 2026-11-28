import type { z } from 'zod';

import { capabilitiesFor } from '@/lib/permissions';
import type { Actor, Capability, Person } from '@/types';

import { type Context, fail } from './api';
import type { ActorRecord, Db, MembershipRecord, PersonRecord } from './db';

export type Member = MembershipRecord & { capabilities: Capability[] };

export function signedIn(db: Db): PersonRecord {
  const person = db.people.find((entry) => entry.id === db.signedIn);
  if (!person) throw fail(401, 'unauthenticated', 'Sign in to continue.');
  return person;
}

export function membership(db: Db, personId: string, projectId: string): Member {
  const record = db.memberships.find(
    (entry) => entry.projectId === projectId && entry.personId === personId,
  );
  if (!record || !db.projects.some((project) => project.id === projectId)) {
    throw fail(404, 'not_found', 'That project doesn’t exist, or you’re not a member of it.');
  }
  return { ...record, capabilities: capabilitiesFor(record.role) };
}

export function can(member: Member, capability: Capability) {
  return member.capabilities.includes(capability);
}

export function need(member: Member, capability: Capability) {
  if (!can(member, capability)) {
    throw fail(
      403,
      'forbidden',
      'Your role in this project doesn’t allow that. Ask the project manager if you need it.',
    );
  }
}

export function inProject({ db, params }: Context, capability?: Capability) {
  const me = signedIn(db);
  const projectId = params.projectId ?? '';
  const member = membership(db, me.id, projectId);
  if (capability) need(member, capability);
  return { me, member, projectId };
}

export async function body<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T>> {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    throw fail(400, 'bad_request', 'The server couldn’t read that request. Try again.');
  }
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.map(String).join('.') || 'form';
    fields[key] ??= issue.message;
  }
  throw fail(422, 'validation', 'Check the highlighted fields, then try again.', fields);
}

export function fullName(person: PersonRecord) {
  return `${person.firstName} ${person.lastName}`;
}

export function person(db: Db, id: string): Person {
  const record = db.people.find((entry) => entry.id === id);
  if (!record) throw new Error(`Mock data refers to a missing person: ${id}`);
  return { id: record.id, name: fullName(record) };
}

export function actor(db: Db, record: ActorRecord): Actor {
  return record.type === 'ai' ? record : { type: 'person', ...person(db, record.id) };
}

export function found<T>(item: T | undefined, what: string): T {
  if (item === undefined) throw fail(404, 'not_found', `${what} doesn’t exist in this project.`);
  return item;
}
