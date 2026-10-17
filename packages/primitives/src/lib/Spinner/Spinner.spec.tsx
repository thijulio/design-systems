import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('is a status region named by its label', () => {
    render(<Spinner label="Loading pets" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading pets');
  });

  it('hides the animated ring from assistive technology', () => {
    const { container } = render(<Spinner label="Loading" size="sm" />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('shows the label beside the ring when labelVisible', () => {
    const { container } = render(
      <Spinner label="Loading pets" labelVisible data-testid="spinner" />,
    );
    const status = screen.getByRole('status');
    expect(status).toBe(screen.getByTestId('spinner'));
    expect(status).toHaveTextContent('Loading pets');
    expect(screen.getByText('Loading pets')).toHaveClass('label');
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
  });

  it('keeps the label visually hidden by default', () => {
    render(<Spinner label="Loading" />);
    expect(screen.getByText('Loading')).toHaveClass('hidden');
  });

  it('forwards ref and DOM props', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} label="Loading" data-testid="spinner" />);
    expect(ref.current).toBe(screen.getByTestId('spinner'));
  });
});
