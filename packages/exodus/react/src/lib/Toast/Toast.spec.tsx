import { createRef } from 'react';
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

  it.each([
    ['danger', 'alert'],
    ['warning', 'alert'],
    ['success', 'status'],
    ['info', 'status'],
  ] as const)('uses role=%s → %s', (tone, role) => {
    render(<Toast tone={tone} title="Heads up" />);
    expect(screen.getByRole(role)).toHaveTextContent('Heads up');
  });

  it('lets an explicit role win', () => {
    render(<Toast tone="danger" title="Failed" role="group" />);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('group')).toHaveTextContent('Failed');
  });

  it('renders no live role with announce={false}', () => {
    render(
      <Toast tone="danger" title="Failed" announce={false} data-testid="t" />,
    );
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByTestId('t')).not.toHaveAttribute('role');
  });

  it('lets an explicit role win over announce={false}', () => {
    render(<Toast title="Saved" announce={false} role="group" />);
    expect(screen.getByRole('group')).toHaveTextContent('Saved');
  });

  it('renders the children alone when there is no title', () => {
    render(<Toast tone="success">Application received</Toast>);
    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent(/^Application received$/);
    expect(toast.firstElementChild?.childElementCount).toBe(1);
  });

  it('shows a dismiss button, named by dismissLabel, only when onClose is given', () => {
    const onClose = jest.fn();
    const { rerender } = render(<Toast title="Hi" />);
    expect(screen.queryByRole('button')).toBeNull();

    rerender(<Toast title="Hi" onClose={onClose} dismissLabel="Fermer" />);
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('forwards a ref to its root', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Toast ref={ref} title="Saved" />);
    expect(ref.current).toBe(screen.getByRole('status'));
  });
});
