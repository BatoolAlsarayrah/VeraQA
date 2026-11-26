import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StageLine } from './StageLine';
import { stageLabels } from './stages';

describe('StageLine', () => {
  it('fills the stops before the current one and rings the current one', () => {
    const { container } = render(<StageLine stage="reviewing-requirements" />);
    const line = container.firstElementChild;
    const stops = [...(line?.children ?? [])].filter((node) =>
      node.className.includes('rounded-full'),
    );

    expect(line).toHaveAttribute('aria-hidden', 'true');
    expect(stops).toHaveLength(6);
    expect(stops[0]).toHaveClass('bg-primary');
    expect(stops[1]).toHaveClass('border-primary', 'size-4');
    expect(stops[2]).toHaveClass('border-border-2');
  });

  it('names every stage', () => {
    expect(stageLabels['running-tests']).toBe('Running tests');
    expect(Object.keys(stageLabels)).toHaveLength(6);
  });
});
