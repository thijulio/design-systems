import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('renders the shared alert with a working retry', () => {
    const onRetry = jest.fn();
    render(
      <ErrorState
        message="Could not load."
        onRetry={onRetry}
        retryLabel="Try again"
        retryTestId="retry"
        retryClassName="extra"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load.');
    const retry = screen.getByRole('button', { name: 'Try again' });
    expect(retry).toBe(screen.getByTestId('retry'));
    expect(retry).toHaveClass('extra');
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('forwards a ref and DOM props to its root', () => {
    const ref = createRef<HTMLElement>();
    render(<ErrorState ref={ref} message="Failed" data-testid="error" />);
    expect(ref.current).toBe(screen.getByTestId('error'));
  });
});
