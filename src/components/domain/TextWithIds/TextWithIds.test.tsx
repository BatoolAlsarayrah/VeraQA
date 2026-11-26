import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TextWithIds } from './TextWithIds';

describe('TextWithIds', () => {
  it('sets every item ID in the mono face and leaves the rest alone', () => {
    const { container } = render(
      <p>
        <TextWithIds>Batool Mahmoud failed TC-031 and reported BUG-007 in Run 12</TextWithIds>
      </p>,
    );
    const mono = [...container.querySelectorAll('.font-mono')].map((node) => node.textContent);

    expect(container).toHaveTextContent(
      'Batool Mahmoud failed TC-031 and reported BUG-007 in Run 12',
    );
    expect(mono).toEqual(['TC-031', 'BUG-007', 'Run 12']);
  });
});
