import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Divider } from './Divider';

describe('Divider', () => {
  it('renders a separator (hr)', () => {
    render(<Divider />);
    expect(screen.getByRole('separator').tagName).toBe('HR');
  });

  it('forwards ref, className and DOM props', () => {
    const ref = createRef<HTMLHRElement>();
    render(<Divider ref={ref} className="extra" data-testid="rule" />);
    const hr = screen.getByTestId('rule');
    expect(ref.current).toBe(hr);
    expect(hr).toHaveClass('extra');
  });
});
