import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { AnalysisBanner } from './AnalysisBanner';

const found = { requirements: 26, issues: 8 };

function renderBanner(props: { files: string[]; step: number; done: boolean }) {
  render(
    <MemoryRouter>
      <AnalysisBanner projectId="p" total={4} found={found} {...props} />
    </MemoryRouter>,
  );
}

describe('AnalysisBanner', () => {
  it('names a single file and links to the analysis while it runs', () => {
    renderBanner({ files: ['SRS_v2.pdf'], step: 2, done: false });

    expect(screen.getByRole('status')).toHaveTextContent('Analyzing SRS_v2.pdf, step 2 of 4');
    expect(screen.getByRole('link', { name: 'Open analysis' })).toHaveAttribute(
      'href',
      '/projects/p/requirements/analysis',
    );
  });

  it('counts the files when there is more than one', () => {
    renderBanner({ files: ['SRS_v2.pdf', 'NFR_addendum.docx'], step: 1, done: false });

    expect(screen.getByRole('status')).toHaveTextContent('Analyzing 2 files, step 1 of 4');
  });

  it('reports what was found and links to Requirements when done', () => {
    renderBanner({ files: ['SRS_v2.pdf'], step: 4, done: true });

    expect(screen.getByRole('status')).toHaveTextContent(
      'Analysis complete: 26 requirements, 8 issues',
    );
    expect(screen.getByRole('link', { name: 'Review' })).toHaveAttribute(
      'href',
      '/projects/p/requirements',
    );
  });
});
