import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Icon } from './Icon';
import { icons } from './icons';

describe('Icon', () => {
  it('is hidden from screen readers by default', () => {
    const { container } = render(<Icon name="bell" />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('is named when it stands alone', () => {
    render(<Icon name="bell" label="Notifications" />);

    expect(screen.getByRole('img', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('keeps the exported duotone layers and colors through currentColor', () => {
    const { container } = render(<Icon name="bell" />);
    const paths = container.querySelectorAll('path');

    expect(paths).toHaveLength(icons.bell.length);
    expect(paths[0]).toHaveAttribute('opacity', '0.5');
    expect(paths[1]).not.toHaveAttribute('opacity');
    paths.forEach((path) => expect(path).toHaveAttribute('fill', 'currentColor'));
  });

  it('draws stroked icons with a stroke', () => {
    const { container } = render(<Icon name="arrow-left" />);

    expect(container.querySelector('path')).toHaveAttribute('stroke', 'currentColor');
  });

  it('renders at the requested size on the 18px grid', () => {
    const { container } = render(<Icon name="bug" size={24} />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('viewBox', '0 0 18 18');
  });
});
