import { z } from 'zod';

import { DefectStatus, Item, Person, Priority, ReviewStatus, TestResult } from './common';

export const SearchResult = z.object({
  item: Item,
  status: z.union([ReviewStatus, TestResult, DefectStatus]),
  priority: Priority.nullable(),
  assignee: Person.nullable(),
});
export type SearchResult = z.infer<typeof SearchResult>;

export const SearchType = z.enum(['requirement', 'scenario', 'test-case', 'defect']);
export type SearchType = z.infer<typeof SearchType>;
