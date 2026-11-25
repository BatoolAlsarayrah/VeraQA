import type { Db } from '../db';

export function seed(now: number): Omit<Db, 'version'> {
  void now;
  return {
    signedIn: null,
    people: [],
    projects: [],
    memberships: [],
    invitations: [],
    files: [],
    requirements: [],
    scenarios: [],
    testCases: [],
    runs: [],
    entries: [],
    defects: [],
    notifications: [],
    activity: [],
    jobs: [],
    emailSettings: {},
  };
}
