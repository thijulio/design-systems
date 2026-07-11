import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  it('renders title and body and wires the tone bar', () => {
    render(
      <Toast tone="success" title="Saved">
        Your changes were saved.
      </Toast>,
    );
    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent('Saved');
    expect(toast.style.getPropertyValue('--toast-bar')).toBe('var(--success)');
  });

  it('shows a dismiss button only when onClose is given', () => {
    const onClose = jest.fn();
    const { rerender } = render(<Toast title="Hi" />);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();

    rerender(<Toast title="Hi" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
