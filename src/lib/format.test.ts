import { describe, expect, it } from 'vitest';

import { when } from './format';

const now = new Date(2026, 10, 26, 15, 0).getTime();
const at = (days: number, hours: number, minutes = 0) =>
  new Date(2026, 10, 26 - days, hours, minutes).toISOString();

describe('when', () => {
  it('says how long ago something happened today', () => {
    expect(when(new Date(now - 20_000).toISOString(), now)).toBe('Just now');
    expect(when(new Date(now - 60_000).toISOString(), now)).toBe('1 minute ago');
    expect(when(new Date(now - 32 * 60_000).toISOString(), now)).toBe('32 minutes ago');
    expect(when(new Date(now - 2 * 3_600_000).toISOString(), now)).toBe('2 hours ago');
    expect(when(at(0, 10, 58), now)).toBe('Today, 10:58');
  });

  it('names the day for older times', () => {
    expect(when(at(1, 11, 5), now)).toBe('Yesterday, 11:05');
    expect(when(at(3, 9), now)).toBe('Monday');
    expect(when(at(23, 9), now)).toBe('3 November');
  });
});
