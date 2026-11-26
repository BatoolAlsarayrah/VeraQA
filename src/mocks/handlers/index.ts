import { memberHandlers } from './members';
import { notificationHandlers } from './notifications';
import { projectHandlers } from './projects';
import { sessionHandlers } from './session';

export const handlers = [
  ...sessionHandlers,
  ...projectHandlers,
  ...memberHandlers,
  ...notificationHandlers,
];
