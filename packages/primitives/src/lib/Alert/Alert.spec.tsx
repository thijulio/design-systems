import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';
import styles from './Alert.module.css';

describe('Alert', () => {
  it('has no live role by default', () => {
    render(<Alert tone="info">Heads up</Alert>);
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Heads up')).toHaveClass(styles.alert, styles.info);
  });

  it('maps live to status and alert roles', () => {
    const { rerender } = render(
      <Alert tone="success" live="polite">
        Saved
      </Alert>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Saved');

    rerender(
      <Alert tone="danger" live="assertive">
        Failed
      </Alert>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
  });

  it('lets an explicit role win over live', () => {
    render(
      <Alert tone="danger" live="polite" role="alert">
        Failed
      </Alert>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('renders children directly when there is no title, icon or action', () => {
    render(
      <Alert tone="warning" as="p" data-testid="notice">
        Plain text
      </Alert>,
    );
    const root = screen.getByTestId('notice');
    expect(root.tagName).toBe('P');
    expect(root.childElementCount).toBe(0);
    expect(root).toHaveTextContent('Plain text');
  });

  it('renders title, icon and action', () => {
    render(
      <Alert
        tone="danger"
        title="Could not load"
        icon={<svg data-testid="icon" />}
        action={<button type="button">Retry</button>}
      >
        Try again later.
      </Alert>,
    );
    expect(screen.getByText('Could not load')).toBeInTheDocument();
    expect(screen.getByText('Try again later.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Alert tone="neutral" ref={ref} data-testid="a">
        x
      </Alert>,
    );
    expect(ref.current).toBe(screen.getByTestId('a'));
  });
});
