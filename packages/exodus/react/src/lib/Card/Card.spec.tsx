import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children and forwards props', () => {
    const onClick = jest.fn();
    render(
      <Card interactive data-testid="card" onClick={onClick}>
        Panel
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveTextContent('Panel');
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders the requested element and forwards a ref to it', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Card as="section" aria-label="Litter" ref={ref} padding="md">
        Panel
      </Card>,
    );
    const region = screen.getByRole('region', { name: 'Litter' });
    expect(ref.current).toBe(region);
  });

  it('renders the shared header row with a level-three title by default', () => {
    render(
      <Card title="Litter" description="Born in May" padding="md">
        Panel
      </Card>,
    );
    expect(
      screen.getByRole('heading', { level: 3, name: 'Litter' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Born in May')).toBeInTheDocument();
  });
});
