import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders kicker, title and body content', () => {
    render(
      <Card kicker="Case study" title="Living interface">
        A resilient, real-time surface.
      </Card>,
    );
    expect(screen.getByText('Case study')).toBeInTheDocument();
    expect(screen.getByText('Living interface')).toBeInTheDocument();
    expect(
      screen.getByText('A resilient, real-time surface.'),
    ).toBeInTheDocument();
  });

  it('renders decorative arcs only for the expressive variant', () => {
    const { container, rerender } = render(<Card title="X">body</Card>);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0);

    rerender(
      <Card variant="expressive" title="X">
        body
      </Card>,
    );
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });

  it('forwards arbitrary props to the root element', () => {
    render(<Card data-testid="card" title="X" />);
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });
});
