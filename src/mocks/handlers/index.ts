import { jobHandlers } from './jobs';
import { memberHandlers } from './members';
import { notificationHandlers } from './notifications';
import { projectHandlers } from './projects';
import { requirementHandlers } from './requirements';
import { sessionHandlers } from './session';

export const handlers = [
  ...sessionHandlers,
  ...projectHandlers,
  ...memberHandlers,
  ...notificationHandlers,
  ...requirementHandlers,
  ...jobHandlers,
];
