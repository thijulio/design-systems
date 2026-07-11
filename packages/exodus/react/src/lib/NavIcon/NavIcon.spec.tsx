import { render } from '@testing-library/react';
import { NavIcon, ICON_PATHS } from './NavIcon';

describe('NavIcon', () => {
  it('renders one path per registry entry for the named glyph', () => {
    const { container } = render(<NavIcon name="paw" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.querySelectorAll('path')).toHaveLength(ICON_PATHS.paw.length);
  });

  it('is decorative by default and labelled when given aria-label', () => {
    const { container, rerender } = render(<NavIcon name="search" />);
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );

    rerender(<NavIcon name="search" aria-label="Search" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', 'Search');
  });
});
