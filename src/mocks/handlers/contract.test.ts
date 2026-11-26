import { describe, expect, it } from 'vitest';

import contract from '../../../API.md?raw';
import { handlers } from '.';

function shape(method: string, path: string) {
  const bare = path
    .replace(/^\*\/api/, '')
    .replace(/\?.*$/, '')
    .replace(/\{[^}]+\}|:[a-zA-Z]+/g, '{}');
  return `${method.toUpperCase()} ${bare}`;
}

function documented() {
  const start = contract.indexOf('## Endpoints at a glance');
  const end = contract.indexOf('## Conventions');
  const rows = contract.slice(start, end).matchAll(/`(GET|POST|PUT|PATCH|DELETE) ([^`]+)`/g);
  return [...rows].map(([, method = '', path = '']) => shape(method, path)).sort();
}

function implemented() {
  return handlers
    .map((handler) => {
      const { method, path } = handler.info as { method: string; path: string };
      return shape(method, path);
    })
    .sort();
}

describe('API.md', () => {
  it('lists exactly the endpoints the mock implements', () => {
    expect(documented()).toEqual(implemented());
  });

  it('tags every endpoint Core or Later', () => {
    const start = contract.indexOf('## Endpoints at a glance');
    const end = contract.indexOf('## Conventions');
    const rows = contract
      .slice(start, end)
      .split('\n')
      .filter((line) => /^\| .+ \| `/.test(line));

    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row, row).toMatch(/\| (Core|Later) +\|$/);
  });
});
