import type { Stage } from '@/types';

export const stageLabels: Record<Stage, string> = {
  'getting-started': 'Getting started',
  'reviewing-requirements': 'Reviewing requirements',
  'designing-tests': 'Designing tests',
  'running-tests': 'Running tests',
  'fixing-defects': 'Fixing defects',
  'closing-defects': 'Closing defects',
};

// Six stops along the workflow (Figma frame 02); fixing and closing defects share the last one.
export const stop: Record<Stage, number> = {
  'getting-started': 1,
  'reviewing-requirements': 2,
  'designing-tests': 3,
  'running-tests': 5,
  'fixing-defects': 6,
  'closing-defects': 6,
};
