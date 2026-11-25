import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Panel } from './Panel';

describe('Panel', () => {
  it('is a region named by its heading', () => {
    render(
      <Panel title="Needs your attention">
        <p>Nothing waiting.</p>
      </Panel>,
    );

    expect(screen.getByRole('region', { name: 'Needs your attention' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Needs your attention' }),
    ).toBeInTheDocument();
  });

  it('can use a lower heading level inside a section', () => {
    render(
      <Panel title="Recent activity" level={3}>
        <p>Batool Hani approved REQ-013</p>
      </Panel>,
    );

    expect(screen.getByRole('heading', { level: 3, name: 'Recent activity' })).toBeInTheDocument();
  });

  it('keeps its actions beside the heading', () => {
    render(
      <Panel title="Open defects by severity" actions={<a href="/defects">Defects</a>}>
        <p>7 open</p>
      </Panel>,
    );

    expect(screen.getByRole('link', { name: 'Defects' })).toBeInTheDocument();
  });
});
