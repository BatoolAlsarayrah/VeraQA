import type { Params, UIMatch } from 'react-router';

import type { Capability } from '@/types';

export type Handle = {
  title: string | ((params: Params, can: (capability: Capability) => boolean) => string);
  can?: Capability;
  narrow?: boolean;
};

function isHandle(value: unknown): value is Handle {
  return typeof value === 'object' && value !== null && 'title' in value;
}

export function deepestHandle(matches: UIMatch[]) {
  const match = matches.findLast((entry) => isHandle(entry.handle));
  return match ? { handle: match.handle as Handle, params: match.params } : null;
}

export function page(title: Handle['title'], options: Omit<Handle, 'title'> = {}): Handle {
  return { title, ...options };
}
