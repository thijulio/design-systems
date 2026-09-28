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
});
