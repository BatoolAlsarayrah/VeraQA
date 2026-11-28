import type { BySeverity } from '@/types';

export type Row = { label: string; value: number; fill: string; opacity: number };

// The Severity Rule: Critical clay, High clay at 45%, Medium ochre, Low quiet text.
export function severityRows(counts: BySeverity): Row[] {
  return [
    { label: 'Critical', value: counts.critical, fill: 'var(--bad-fill)', opacity: 1 },
    { label: 'High', value: counts.high, fill: 'var(--bad-fill)', opacity: 0.45 },
    { label: 'Medium', value: counts.medium, fill: 'var(--warn-fill)', opacity: 1 },
    { label: 'Low', value: counts.low, fill: 'var(--text-3)', opacity: 1 },
  ];
}

export type Results = { passed: number; failed: number; blocked: number; notRun: number };

export function resultRows(counts: Results): Row[] {
  return [
    { label: 'Passed', value: counts.passed, fill: 'var(--ok-fill)', opacity: 1 },
    { label: 'Failed', value: counts.failed, fill: 'var(--bad-fill)', opacity: 1 },
    { label: 'Blocked', value: counts.blocked, fill: 'var(--warn-fill)', opacity: 1 },
    { label: 'Not run', value: counts.notRun, fill: 'var(--neutral-bg)', opacity: 1 },
  ];
}
