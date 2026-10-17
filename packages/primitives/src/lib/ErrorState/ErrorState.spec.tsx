import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('announces the whole panel as an alert by default', () => {
    render(
      <ErrorState
        message="Could not load the list."
        onRetry={jest.fn()}
        retryLabel="Try again"
      />,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Could not load the list.');
    expect(alert).toContainElement(
      screen.getByRole('button', { name: 'Try again' }),
    );
    expect(screen.getByText('Could not load the list.').tagName).toBe('P');
  });

  it('can announce only the message, or nothing', () => {
    const { rerender } = render(
      <ErrorState
        message="Failed"
        announce="message"
        onRetry={jest.fn()}
        retryLabel="Retry"
        data-testid="root"
      />,
    );
    expect(screen.getByRole('alert')).toBe(screen.getByText('Failed'));
    expect(screen.getByTestId('root')).not.toHaveAttribute('role');

    rerender(<ErrorState message="Failed" announce="off" />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('puts messageTestId on the message, not on the root', () => {
    render(
      <ErrorState
        message="Failed"
        announce="message"
        messageTestId="message"
        data-testid="root"
        onRetry={jest.fn()}
        retryLabel="Retry"
      />,
    );
    const message = screen.getByTestId('message');
    expect(message.tagName).toBe('P');
    expect(message).toHaveAttribute('role', 'alert');
    expect(message).toHaveTextContent(/^Failed$/);
    expect(screen.getByTestId('root')).toContainElement(message);
  });

  it('sets no message testid by default', () => {
    render(<ErrorState message="Failed" />);
    expect(screen.getByText('Failed')).not.toHaveAttribute('data-testid');
  });

  it('lets an explicit role win over announce', () => {
    render(<ErrorState message="Failed" role="status" />);
    expect(screen.getByRole('status')).toHaveTextContent('Failed');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders the title at the requested heading level', () => {
    render(
      <ErrorState
        title="Something went wrong"
        headingLevel={1}
        message="Try again later."
        announce="message"
      />,
    );
    const heading = screen.getByRole('heading', {
      name: 'Something went wrong',
      level: 1,
    });
    // The alert wraps the title and message, not the retry action.
    expect(screen.getByRole('alert')).toContainElement(heading);
    expect(screen.getByRole('alert')).toHaveTextContent('Try again later.');
  });

  it('runs the retry handler and puts the test id on the button', () => {
    const onRetry = jest.fn();
    render(
      <ErrorState
        message="Failed"
        onRetry={onRetry}
        retryLabel="Retry"
        retryTestId="retry"
      />,
    );
    fireEvent.click(screen.getByTestId('retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('retry')).toHaveAttribute('type', 'button');
  });

  it('renders no button without both a handler and a label', () => {
    const { rerender } = render(
      <ErrorState message="Failed" onRetry={jest.fn()} />,
    );
    expect(screen.queryByRole('button')).toBeNull();

    rerender(<ErrorState message="Failed" retryLabel="Retry" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('marks the retry busy, refuses the press and keeps focus', () => {
    const onRetry = jest.fn();
    const { rerender } = render(
      <ErrorState
        message="Failed"
        onRetry={onRetry}
        retryLabel="Retry"
        retrying={false}
      />,
    );
    const button = screen.getByRole('button', { name: 'Retry' });
    expect(button).toHaveAttribute('aria-busy', 'false');
    button.focus();

    rerender(
      <ErrorState
        message="Failed"
        onRetry={onRetry}
        retryLabel="Retry"
        retrying
      />,
    );
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).not.toBeDisabled();
    expect(button).toHaveFocus();
    fireEvent.click(button);
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('renders a div message for block content', () => {
    render(
      <ErrorState
        messageAs="div"
        message={
          <>
            <p>First failure</p>
            <p>Second failure</p>
          </>
        }
      />,
    );
    expect(screen.getByText('First failure').parentElement?.tagName).toBe(
      'DIV',
    );
  });

  it('forwards a ref and DOM props to its root', () => {
    const ref = createRef<HTMLElement>();
    render(<ErrorState ref={ref} message="Failed" data-testid="error" />);
    expect(ref.current).toBe(screen.getByTestId('error'));
    expect(ref.current).toHaveAttribute('role', 'alert');
  });
});
