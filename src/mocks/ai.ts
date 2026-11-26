import type { AnalysisResult, Finding } from '@/types';

import type { RequirementRecord, ScenarioRecord, TestCaseRecord } from './db';
import { event } from './log';

// Canned stand-ins for what n8n and the LLM return. The mock never reads the uploaded file.
type Draft = {
  section: string;
  title: string;
  text: string;
  findings?: Omit<Finding, 'n' | 'resolved' | 'related'>[];
  rewrite?: string;
};

const fromFiles: Draft[] = [
  {
    section: 'Accounts',
    title: 'Update the delivery address',
    text: 'Users shall be able to update their delivery address.',
    findings: [
      {
        kind: 'missing-information',
        text: 'It doesn’t say whether the address can change after an order is placed.',
      },
    ],
  },
  {
    section: 'Accounts',
    title: 'Send a password reset link valid for 1 hour',
    text: 'The system shall send a password reset link that stays valid for 1 hour.',
  },
  {
    section: 'Checkout',
    title: 'Load the checkout page quickly',
    text: 'The checkout page shall load quickly.',
    findings: [{ kind: 'ambiguous', text: '“Quickly” has no measure. Say how fast it must load.' }],
    rewrite: 'The checkout page shall load within 2 seconds.',
  },
  {
    section: 'Orders',
    title: 'Keep order records for 5 years',
    text: 'The system shall keep order records for 5 years.',
  },
  {
    section: 'Orders',
    title: 'Cancel an order before it ships',
    text: 'Users shall be able to cancel an order before it ships.',
  },
  {
    section: 'Security',
    title: 'Sign out inactive sessions',
    text: 'The system shall sign out inactive sessions after a while.',
    findings: [
      { kind: 'ambiguous', text: '“After a while” has no measure. Say how many minutes.' },
    ],
    rewrite: 'The system shall sign out sessions after 30 minutes without activity.',
  },
  {
    section: 'Catalog',
    title: 'Mark out-of-stock products as unavailable',
    text: 'The system shall show products that are out of stock as unavailable.',
  },
  {
    section: 'Checkout',
    title: 'Save several delivery addresses',
    text: 'Users shall be able to save several delivery addresses.',
    findings: [{ kind: 'ambiguous', text: '“Several” has no number. Say how many addresses.' }],
  },
  {
    section: 'Notifications',
    title: 'Text the customer when an order ships',
    text: 'The system shall notify users by SMS when an order ships.',
  },
];

const vague: [word: RegExp, label: string, replacement: string | null][] = [
  [/\bquickly\b/i, 'Quickly', 'within 1 second'],
  [/\bfast\b/i, 'Fast', 'within 2 seconds'],
  [/\bseveral\b/i, 'Several', null],
  [/\beasy to use\b/i, 'Easy to use', null],
  [/\buser-friendly\b/i, 'User-friendly', null],
  [/\bafter a while\b/i, 'After a while', 'after 30 minutes'],
];

function titleOf(text: string) {
  const bare = text
    .replace(/\.$/, '')
    .replace(/^(the system|users) shall (be able to )?/i, '')
    .replace(/^the /i, '')
    .trim();
  const title = bare.charAt(0).toUpperCase() + bare.slice(1);
  return title.length > 80 ? `${title.slice(0, 77)}…` : title;
}

function typedDraft(line: string): Draft {
  const text = /[.!?]$/.test(line) ? line : `${line}.`;
  const hit = vague.find(([word]) => word.test(text));
  if (!hit) return { section: 'Typed requirements', title: titleOf(text), text };
  const [word, label, replacement] = hit;
  return {
    section: 'Typed requirements',
    title: titleOf(text),
    text,
    findings: [{ kind: 'ambiguous', text: `“${label}” has no measure. Say exactly how much.` }],
    ...(replacement && { rewrite: text.replace(word, replacement) }),
  };
}

export function lines(text: string) {
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*(\d+[.)]|[-*•])\s*/, '').trim())
    .filter(Boolean);
}

type Source = { file: string | null; page: number | null };

function record(projectId: string, draft: Draft, source: Source): RequirementRecord {
  return {
    projectId,
    id: '',
    title: draft.title,
    text: draft.text,
    section: draft.section,
    type: /\b(within|seconds?|minutes?|load|secure)\b/i.test(draft.text)
      ? 'non-functional'
      : 'functional',
    status: 'pending-review',
    priority: null,
    origin: 'ai',
    confidence: draft.findings?.length ? 0.78 : 0.91,
    source: { file: source.file, section: source.file ? draft.section : null, page: source.page },
    findings: (draft.findings ?? []).map((finding, index) => ({
      ...finding,
      n: index + 1,
      related: null,
      resolved: false,
    })),
    rewrite: draft.rewrite ?? null,
    rejectionReason: null,
    decidedBy: null,
    decidedAt: null,
    assigneeId: null,
    due: null,
    history: [event({ type: 'ai' }, 'drafted')],
  };
}

export function analyze(
  projectId: string,
  input: { files: { name: string; pages: number }[] } | { text: string },
  known: string[],
) {
  const drafts: { draft: Draft; source: Source }[] = [];
  if ('text' in input) {
    for (const line of lines(input.text)) {
      drafts.push({ draft: typedDraft(line), source: { file: null, page: null } });
    }
  } else {
    const unused = fromFiles.filter((entry) => !known.includes(entry.text));
    for (const file of input.files) {
      unused.splice(0, 3).forEach((draft, index) => {
        drafts.push({ draft, source: { file: file.name, page: 2 + index * 3 } });
      });
    }
  }
  const pending = drafts.map(({ draft, source }) => record(projectId, draft, source));
  const findings = pending.flatMap((entry) => entry.findings);
  const result: AnalysisResult = {
    requirements: pending.length,
    sections: new Set(pending.map((entry) => entry.section)).size,
    ambiguous: findings.filter((finding) => finding.kind === 'ambiguous').length,
    missingInformation: findings.filter((finding) => finding.kind === 'missing-information').length,
    contradictions: findings.filter((finding) => finding.kind === 'contradiction').length,
    rewrites: pending.filter((entry) => entry.rewrite).length,
  };
  return { pending, result };
}

const tooVague = /\b(easy|fast|quickly|modern|well|user-friendly|nice|soon)\b/i;

function sentence(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1).replace(/\.$/, '');
}

export function vagueReason(requirement: RequirementRecord) {
  const word = tooVague.exec(requirement.text)?.[0];
  if (!word || /\d/.test(requirement.text)) return null;
  return `Too vague to test. Say what “${word.toLowerCase()}” means in a way someone can check.`;
}

export function draftScenarios(requirement: RequirementRecord) {
  const drafts: Pick<ScenarioRecord, 'title' | 'description' | 'type' | 'precondition'>[] = [
    {
      title: requirement.title,
      description: `The normal case: ${sentence(requirement.text)}.`,
      type: 'positive',
      precondition: null,
    },
  ];
  if (requirement.type === 'functional') {
    drafts.push({
      title: `Refuse what isn’t allowed: ${sentence(requirement.title)}`,
      description: `Wrong or missing input is refused with a clear message, and nothing changes.`,
      type: 'negative',
      precondition: null,
    });
  }
  return drafts;
}

export function testDataReason(scenario: ScenarioRecord) {
  if (scenario.testData.length || !scenario.precondition) return null;
  if (!/\b(already|existing|registered)\b/i.test(scenario.precondition)) return null;
  return `The AI needs ${sentence(scenario.precondition)} to test against. Add it as test data, then generate again.`;
}

export function draftTestCases(scenario: ScenarioRecord) {
  const setup: [string, string] = [
    scenario.precondition
      ? `Check that ${sentence(scenario.precondition)}.`
      : 'Open the page under test.',
    'everything is ready to start.',
  ];
  const drafts: (Pick<TestCaseRecord, 'title' | 'type'> & { steps: [string, string][] })[] = [
    {
      title: scenario.title,
      type: 'normal',
      steps: [
        setup,
        [`Follow the scenario: ${sentence(scenario.title)}.`, sentence(scenario.description)],
      ],
    },
    {
      title: `${scenario.title}, with wrong input`,
      type: 'wrong-input',
      steps: [
        setup,
        [
          'Enter a value that isn’t allowed.',
          'a clear message says what to fix, and nothing is saved.',
        ],
      ],
    },
  ];
  if (scenario.priority === 'high' || scenario.priority === 'critical') {
    drafts.push({
      title: `${scenario.title}, at the limit`,
      type: 'limit',
      steps: [setup, ['Use the largest value that is still allowed.', 'it’s accepted.']],
    });
  }
  return drafts.map((draft) => ({
    ...draft,
    steps: draft.steps.map(([action, expected], index) => ({ n: index + 1, action, expected })),
  }));
}
