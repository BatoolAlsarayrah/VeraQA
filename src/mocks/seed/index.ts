import type { ItemType } from '@/types';

import type { Db } from '../db';
import { activity } from './activity';
import { clock } from './clock';
import { defects } from './defects';
import { jobs } from './jobs';
import { notifications } from './notifications';
import { people } from './people';
import { invitations, memberships, projects } from './projects';
import { files, requirements } from './requirements';
import { runs } from './runs';
import { scenarios } from './scenarios';
import { testCases } from './testCases';

export { DEMO_PASSWORD } from './people';

export function seed(now: number): Omit<Db, 'version'> {
  const t = clock(now);
  const records = {
    requirements: requirements(t),
    scenarios: scenarios(t),
    testCases: testCases(t),
  };
  const { runs: runRecords, entries } = runs(t, records.testCases);
  const defectRecords = defects(t);

  const titles = (projectId: string, type: ItemType, id: string) => {
    const lists: Record<ItemType, { projectId: string; id: string; title: string }[]> = {
      requirement: records.requirements,
      scenario: records.scenarios,
      'test-case': records.testCases,
      defect: defectRecords,
      run: runRecords.map((run) => ({
        projectId: run.projectId,
        id: String(run.number),
        title: run.name,
      })),
      file: [],
    };
    if (type === 'file') return id;
    const found = lists[type].find((entry) => entry.projectId === projectId && entry.id === id);
    if (!found) throw new Error(`Seed activity refers to a missing ${type} ${id}`);
    return found.title;
  };

  return {
    signedIn: 'batool-hani',
    people,
    projects: projects(t),
    memberships,
    invitations: invitations(t),
    files: files(t),
    ...records,
    runs: runRecords,
    entries,
    defects: defectRecords,
    notifications: notifications(t),
    activity: activity(t, titles),
    jobs: jobs(t, records),
    emailSettings: {},
  };
}
