import { activityHandlers } from './activity';
import { dashboardHandlers } from './dashboard';
import { defectHandlers } from './defects';
import { jobHandlers } from './jobs';
import { memberHandlers } from './members';
import { myWorkHandlers } from './myWork';
import { notificationHandlers } from './notifications';
import { projectHandlers } from './projects';
import { reportHandlers } from './reports';
import { requirementHandlers } from './requirements';
import { runHandlers } from './runs';
import { scenarioHandlers } from './scenarios';
import { searchHandlers } from './search';
import { sessionHandlers } from './session';
import { testCaseHandlers } from './testCases';
import { traceHandlers } from './traceability';

export const handlers = [
  ...sessionHandlers,
  ...projectHandlers,
  ...memberHandlers,
  ...notificationHandlers,
  ...requirementHandlers,
  ...scenarioHandlers,
  ...testCaseHandlers,
  ...runHandlers,
  ...defectHandlers,
  ...dashboardHandlers,
  ...myWorkHandlers,
  ...traceHandlers,
  ...reportHandlers,
  ...activityHandlers,
  ...searchHandlers,
  ...jobHandlers,
];
