import { jobHandlers } from './jobs';
import { memberHandlers } from './members';
import { notificationHandlers } from './notifications';
import { projectHandlers } from './projects';
import { requirementHandlers } from './requirements';
import { scenarioHandlers } from './scenarios';
import { sessionHandlers } from './session';
import { testCaseHandlers } from './testCases';

export const handlers = [
  ...sessionHandlers,
  ...projectHandlers,
  ...memberHandlers,
  ...notificationHandlers,
  ...requirementHandlers,
  ...scenarioHandlers,
  ...testCaseHandlers,
  ...jobHandlers,
];
