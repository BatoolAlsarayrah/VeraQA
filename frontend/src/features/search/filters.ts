import type { Status } from '@/components/domain';
import type { SearchType } from '@/types';

export const types: { value: SearchType; label: string }[] = [
  { value: 'requirement', label: 'Requirements' },
  { value: 'scenario', label: 'Scenarios' },
  { value: 'test-case', label: 'Test cases' },
  { value: 'defect', label: 'Defects' },
];

const review: Status[] = ['pending-review', 'approved', 'rejected'];
const results: Status[] = ['not-run', 'passed', 'failed', 'blocked'];
const lifecycle: Status[] = [
  'open',
  'in-progress',
  'fixed',
  'retest',
  'reopened',
  'closed',
  'invalid',
];

// An approved test case is searched by its last result, so its status list swaps Approved for the
// results (API.md, Search).
export function statusesFor(type: string): Status[] {
  if (type === 'requirement' || type === 'scenario') return review;
  if (type === 'test-case') return ['pending-review', 'rejected', ...results];
  if (type === 'defect') return lifecycle;
  return [...review, ...results, ...lifecycle];
}
