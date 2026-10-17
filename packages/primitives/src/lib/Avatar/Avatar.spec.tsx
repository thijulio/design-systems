import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders its initials', () => {
    render(<Avatar initials="KT" />);
    expect(screen.getByText('KT')).toBeInTheDocument();
  });

  it('forwards an accessible label', () => {
    render(<Avatar initials="KT" aria-label="Katia" />);
    expect(screen.getByLabelText('Katia')).toHaveTextContent('KT');
  });

  it('forwards a ref to its root span', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar initials="KT" ref={ref} />);
    expect(ref.current).toBe(screen.getByText('KT'));
  });
});
