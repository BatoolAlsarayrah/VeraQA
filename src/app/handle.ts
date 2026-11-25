import type { Params, UIMatch } from 'react-router';

import type { Stage } from '@/components/layout';
import type { Capability } from '@/types';

type Can = (capability: Capability) => boolean;
type Text = string | ((params: Params, can: Can) => string);

export type Handle = {
  title: Text;
  crumb?: Text;
  can?: Capability;
  narrow?: boolean;
  stage?: Stage;
};

function isHandle(value: unknown): value is Handle {
  return typeof value === 'object' && value !== null && 'title' in value;
}

export function deepestHandle(matches: UIMatch[]) {
  const match = matches.findLast((entry) => isHandle(entry.handle));
  return match ? { handle: match.handle as Handle, params: match.params } : null;
}

export function resolve(text: Text, params: Params, can: Can) {
  return typeof text === 'function' ? text(params, can) : text;
}

export function page(title: Handle['title'], options: Omit<Handle, 'title'> = {}): Handle {
  return { title, ...options };
}
