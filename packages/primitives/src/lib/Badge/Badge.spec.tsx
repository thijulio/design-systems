import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its label', () => {
    render(<Badge tone="success">OK</Badge>);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('forwards DOM props', () => {
    render(<Badge aria-label="3 new">3</Badge>);
    expect(screen.getByLabelText('3 new')).toHaveTextContent('3');
  });

  it('exposes its tone as data-tone and forwards a ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Badge tone="danger" ref={ref}>
        Overdue
      </Badge>,
    );
    const badge = screen.getByText('Overdue');
    expect(badge).toHaveAttribute('data-tone', 'danger');
    expect(ref.current).toBe(badge);
  });
});
