import { describe, expect, it } from 'vitest';

import { counted, dayGroup, dayLabel, dueLabel, when } from './format';

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

describe('dayLabel and counted', () => {
  it('writes a date as day and month', () => {
    expect(dayLabel('2026-12-20')).toBe('20 December');
  });

  it('counts in the singular or the plural', () => {
    expect(counted(1, 'requirement')).toBe('1 requirement');
    expect(counted(5, 'requirement')).toBe('5 requirements');
  });
});

describe('dueLabel', () => {
  it('says how soon something is due', () => {
    expect(dueLabel('2026-11-25', now)).toEqual({ text: 'Overdue', urgent: true });
    expect(dueLabel('2026-11-26', now)).toEqual({ text: 'Due today', urgent: true });
    expect(dueLabel('2026-11-27', now)).toEqual({ text: 'Due tomorrow', urgent: false });
    expect(dueLabel('2026-11-30', now)).toEqual({ text: 'This week', urgent: false });
    expect(dueLabel('2026-12-04', now)).toEqual({ text: 'Due 4 December', urgent: false });
  });
});

describe('dayGroup', () => {
  it('puts a time in a day group', () => {
    expect(dayGroup(at(0, 9), now)).toBe('Today');
    expect(dayGroup(at(1, 9), now)).toBe('Yesterday');
    expect(dayGroup(at(3, 9), now)).toBe('Earlier this week');
    expect(dayGroup(at(23, 9), now)).toBe('3 November');
  });
});
