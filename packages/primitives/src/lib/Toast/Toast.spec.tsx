import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Toast } from './Toast';
import styles from './Toast.module.css';

describe('Toast', () => {
  it('renders title and body and takes the tone class', () => {
    render(
      <Toast tone="success" title="Saved">
        Your changes were saved.
      </Toast>,
    );
    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent(/^SavedYour changes were saved\.$/);
    expect(toast).toHaveClass(styles.toast, styles.success);
    expect(screen.getByText('Saved')).toHaveClass(styles.title);
    expect(screen.getByText('Your changes were saved.')).toHaveClass(
      styles.body,
    );
  });

  it('defaults to the info tone', () => {
    render(<Toast title="Heads up" />);
    expect(screen.getByRole('status')).toHaveClass(styles.info);
  });

  it.each([
    ['danger', 'alert'],
    ['warning', 'alert'],
    ['success', 'status'],
    ['info', 'status'],
  ] as const)('maps tone %s to role=%s', (tone, role) => {
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
    expect(screen.getByText('Application received')).toHaveClass(styles.lead);
    expect(toast.firstElementChild?.childElementCount).toBe(1);
  });

  it('shows a dismiss button, named by dismissLabel, only with onClose', () => {
    const onClose = jest.fn();
    const { rerender } = render(<Toast title="Hi" />);
    expect(screen.queryByRole('button')).toBeNull();

    rerender(<Toast title="Hi" onClose={onClose} dismissLabel="Close" />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('passes DOM props and className through', () => {
    render(<Toast title="Hi" data-testid="toast" className="extra" />);
    expect(screen.getByTestId('toast')).toHaveClass(styles.toast, 'extra');
  });

  it('forwards a ref to its root', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Toast ref={ref} title="Saved" />);
    expect(ref.current).toBe(screen.getByRole('status'));
  });
});
