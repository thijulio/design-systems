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
});
