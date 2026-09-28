import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders its children', () => {
    render(<Card>Pet passport</Card>);
    expect(screen.getByText('Pet passport')).toBeInTheDocument();
  });

  it('forwards DOM props such as role', () => {
    render(<Card role="region">content</Card>);
    expect(screen.getByRole('region')).toHaveTextContent('content');
  });
});
