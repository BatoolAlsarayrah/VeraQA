import { AssignmentInput, type MyWork, type WorkGroup, type WorkItem } from '@/types';

import { api, fail } from '../api';
import type { Db } from '../db';
import { by, notify } from '../log';
import { body, can, inProject, membership, person } from '../rules';
import { work } from '../work';

const invalid = 'Check the highlighted fields, then try again.';
const empty = {
  due: null,
  run: null,
  assignedBy: null,
  openFindings: null,
  draftedFor: null,
  blockedBy: null,
  blockedStep: null,
  fixedBy: null,
  retest: null,
} satisfies Omit<WorkItem, 'item'>;

function runRef(db: Db, projectId: string, number: number) {
  const run = db.runs.find((entry) => entry.projectId === projectId && entry.number === number);
  return { number, name: run?.name ?? `Run ${String(number)}` };
}

function testCaseRef(db: Db, projectId: string, id: string | undefined) {
  const testCase = db.testCases.find((entry) => entry.projectId === projectId && entry.id === id);
  return testCase ? { id: testCase.id, title: testCase.title } : null;
}

function myWork(db: Db, projectId: string, personId: string): MyWork {
  const items = work(db, projectId, personId);
  const groups: WorkGroup[] = [
    {
      kind: 'requirements-to-review',
      items: items.requirements.map((entry) => ({
        ...empty,
        item: { type: 'requirement', id: entry.id, title: entry.title },
        due: entry.due,
        openFindings: entry.findings.filter((finding) => !finding.resolved).length,
      })),
    },
    {
      kind: 'drafts-to-approve',
      items: items.drafts.map((entry) => {
        const scenario = 'requirementId' in entry;
        const parent = scenario
          ? db.requirements.find(
              (item) => item.projectId === projectId && item.id === entry.requirementId,
            )
          : db.scenarios.find(
              (item) => item.projectId === projectId && item.id === entry.scenarioId,
            );
        return {
          ...empty,
          item: { type: scenario ? 'scenario' : 'test-case', id: entry.id, title: entry.title },
          due: entry.due,
          draftedFor: parent
            ? { type: scenario ? 'requirement' : 'scenario', id: parent.id, title: parent.title }
            : null,
        } satisfies WorkItem;
      }),
    },
    {
      kind: 'tests-to-run',
      items: items.tests.map((entry) => ({
        ...empty,
        item: {
          type: 'test-case',
          ...(testCaseRef(db, projectId, entry.testCaseId) ?? { id: entry.testCaseId, title: '' }),
        },
        due: entry.due,
        run: runRef(db, projectId, entry.run),
      })),
    },
    {
      kind: 'ready-to-run-again',
      items: items.readyAgain.map((entry) => {
        const defect = db.defects.find(
          (item) => item.projectId === projectId && item.id === entry.blocked?.defectId,
        );
        return {
          ...empty,
          item: {
            type: 'test-case',
            ...(testCaseRef(db, projectId, entry.testCaseId) ?? {
              id: entry.testCaseId,
              title: '',
            }),
          },
          due: entry.due,
          run: runRef(db, projectId, entry.run),
          blockedBy: defect ? { id: defect.id, title: defect.title, status: defect.status } : null,
          blockedStep: entry.blocked?.step ?? null,
        } satisfies WorkItem;
      }),
    },
    {
      kind: 'retests',
      items: items.retests.map((defect) => ({
        ...empty,
        item: { type: 'defect', id: defect.id, title: defect.title },
        fixedBy: person(db, defect.assigneeId),
        retest: testCaseRef(db, projectId, defect.source?.testCaseId),
      })),
    },
    {
      kind: 'defects-to-fix',
      items: items.fixes.map((defect) => ({
        ...empty,
        item: { type: 'defect', id: defect.id, title: defect.title },
      })),
    },
  ];
  return { groups: groups.filter((group) => group.items.length > 0) };
}

export const myWorkHandlers = [
  api.get('/projects/:projectId/my-work', (context) => {
    const { me, projectId } = inProject(context, 'workspace');
    return myWork(context.db, projectId, me.id);
  }),

  api.post('/projects/:projectId/assignments', async (context) => {
    const { me, projectId } = inProject(context, 'manage');
    const input = await body(context.request, AssignmentInput);
    const { db } = context;
    if (
      !db.memberships.some(
        (entry) => entry.projectId === projectId && entry.personId === input.assigneeId,
      )
    ) {
      throw fail(422, 'validation', invalid, { assigneeId: 'Choose someone in this project.' });
    }
    const assignee = membership(db, input.assigneeId, projectId);
    for (const [index, ref] of input.items.entries()) {
      const field = `items.${String(index)}`;
      if (ref.type === 'defect') {
        const defect = db.defects.find(
          (entry) => entry.projectId === projectId && entry.id === ref.id,
        );
        if (!defect)
          throw fail(422, 'validation', invalid, {
            [field]: `${ref.id} doesn’t exist in this project.`,
          });
        if (!can(assignee, 'fix')) {
          throw fail(422, 'validation', invalid, {
            assigneeId: 'Defects go to someone who can fix them.',
          });
        }
        if (!['open', 'in-progress', 'reopened'].includes(defect.status)) {
          throw fail(422, 'validation', invalid, {
            [field]: `${ref.id} is past fixing, so it can’t be reassigned.`,
          });
        }
        defect.assigneeId = input.assigneeId;
        continue;
      }
      const list = {
        requirement: db.requirements,
        scenario: db.scenarios,
        'test-case': db.testCases,
      }[ref.type];
      const record = list.find((entry) => entry.projectId === projectId && entry.id === ref.id);
      if (!record)
        throw fail(422, 'validation', invalid, {
          [field]: `${ref.id} doesn’t exist in this project.`,
        });
      if (record.status === 'pending-review' && !can(assignee, 'approve')) {
        throw fail(422, 'validation', invalid, {
          assigneeId: 'Items to review go to a QA lead or the project manager.',
        });
      }
      record.assigneeId = input.assigneeId;
      record.due = input.due;
    }
    if (input.assigneeId !== me.id) {
      const count = input.items.length;
      notify(db, {
        personId: input.assigneeId,
        projectId,
        title: `${person(db, me.id).name} assigned you ${String(count)} ${count === 1 ? 'item' : 'items'}`,
        detail: input.items.map((ref) => ref.id).join(', '),
        actor: by(me.id),
        target: { type: 'my-work', id: null },
      });
    }
  }),
];
