import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Icon, ICON_NAMES } from './Icon';

describe('Icon', () => {
  it('is decorative without a label', () => {
    const { container } = render(<Icon name="close" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
  });

  it('is a named image with a label', () => {
    render(<Icon name="info" label="Information" />);
    const img = screen.getByRole('img', { name: 'Information' });
    expect(img).not.toHaveAttribute('aria-hidden');
  });

  it('draws in currentColor at the requested size', () => {
    const { container } = render(<Icon name="search" size={16} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('has paths for every registered name', () => {
    for (const name of ICON_NAMES) {
      const { container, unmount } = render(<Icon name={name} />);
      expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
      unmount();
    }
  });

  it('fills the filled variants', () => {
    const { container } = render(<Icon name="bookmark-filled" />);
    expect(container.querySelector('svg')).toHaveAttribute('fill', 'currentColor');
  });

  it('forwards ref', () => {
    const ref = createRef<SVGSVGElement>();
    const { container } = render(<Icon name="check" ref={ref} />);
    expect(ref.current).toBe(container.querySelector('svg'));
  });
});
