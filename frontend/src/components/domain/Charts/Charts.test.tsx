import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ResultsChart } from './ResultsChart';
import { SeverityChart } from './SeverityChart';

const cells = (table: HTMLElement) =>
  within(table)
    .getAllByRole('row')
    .slice(1)
    .map((row) => row.textContent);

describe('SeverityChart', () => {
  it('gives the bars a table in severity order for screen readers', () => {
    const { container } = render(
      <SeverityChart
        caption="Open defects by severity"
        counts={{ critical: 1, high: 3, medium: 2, low: 1 }}
      />,
    );

    const table = screen.getByRole('table', { name: 'Open defects by severity' });
    expect(cells(table)).toEqual(['Critical1', 'High3', 'Medium2', 'Low1']);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});

describe('ResultsChart', () => {
  it('gives the stacked bar a table of results', () => {
    render(
      <ResultsChart
        caption="Test results in Run 12"
        counts={{ passed: 18, failed: 3, blocked: 1, notRun: 12 }}
      />,
    );

    expect(cells(screen.getByRole('table', { name: 'Test results in Run 12' }))).toEqual([
      'Passed18',
      'Failed3',
      'Blocked1',
      'Not run12',
    ]);
  });
});
