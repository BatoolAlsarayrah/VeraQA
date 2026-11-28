import type { Capability } from '@/types';

import { useProject } from './useProject';

export function useCan(capability: Capability) {
  return useProject()?.capabilities.includes(capability) ?? false;
}
