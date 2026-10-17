import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders initials and scales font with size', () => {
    render(<Avatar initials="TV" size={50} />);
    const el = screen.getByText('TV');
    expect(el.style.getPropertyValue('--av-size')).toBe('50px');
    expect(el.style.getPropertyValue('--av-font')).toBe('19px');
  });

  it('applies a fixed tone override', () => {
    render(<Avatar initials="AB" tone="teal" />);
    expect(screen.getByText('AB').style.getPropertyValue('--av-bg')).toBe(
      'var(--tone-teal-soft)',
    );
  });

  it('forwards a ref to its root span', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar initials="KT" ref={ref} />);
    expect(ref.current).toBe(screen.getByText('KT'));
  });
});
