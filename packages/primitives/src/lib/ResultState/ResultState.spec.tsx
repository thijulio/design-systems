import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { ResultState } from './ResultState';
import styles from './ResultState.module.css';

describe('ResultState', () => {
  it('announces the title and message as a status, not the actions', () => {
    render(
      <ResultState
        title="Address confirmed"
        message="You can sign in now."
        outcomeTestId="outcome"
        actions={<a href="/login">Sign in</a>}
      />,
    );
    const status = screen.getByRole('status');
    expect(status).toBe(screen.getByTestId('outcome'));
    expect(status).toHaveTextContent(
      /^Address confirmedYou can sign in now\.$/,
    );
    expect(status).not.toContainElement(
      screen.getByRole('link', { name: 'Sign in' }),
    );
    expect(screen.getByText('You can sign in now.').tagName).toBe('P');
  });

  it('renders the title as a level 1 heading by default', () => {
    const { rerender } = render(<ResultState title="Done" />);
    expect(
      screen.getByRole('heading', { name: 'Done', level: 1 }),
    ).toBeInTheDocument();

    rerender(<ResultState title="Done" headingLevel={2} />);
    expect(
      screen.getByRole('heading', { name: 'Done', level: 2 }),
    ).toBeInTheDocument();
  });

  it('can announce as an alert, or not at all', () => {
    const { rerender } = render(
      <ResultState title="Unavailable" announce="alert" />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Unavailable');
    expect(screen.queryByRole('status')).toBeNull();

    rerender(<ResultState title="Unavailable" announce="off" />);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('keeps the outcome, the extra content and the actions in order', () => {
    const { container } = render(
      <ResultState
        title="Live"
        message="Your workspace is ready."
        actions={<button type="button">Open</button>}
      >
        <dl data-testid="record" />
      </ResultState>,
    );
    const root = container.firstElementChild as HTMLElement;
    const [outcome, record, actions] = Array.from(root.children);
    expect(outcome).toHaveAttribute('role', 'status');
    expect(record).toBe(screen.getByTestId('record'));
    expect(actions).toHaveClass(styles.actions);
    expect(actions).toContainElement(screen.getByRole('button'));
  });

  it('renders no built-in text and no empty slots', () => {
    const { container } = render(<ResultState title="Rien" />);
    expect(container).toHaveTextContent(/^Rien$/);
    expect(container.querySelector('p')).toBeNull();
    expect(container.querySelector(`.${styles.actions}`)).toBeNull();
  });

  it('renders a decorative icon tile in the requested tone', () => {
    render(
      <ResultState
        title="Sent"
        tone="success"
        icon={<svg data-testid="glyph" />}
      />,
    );
    const tile = screen.getByTestId('glyph').parentElement;
    expect(tile).toHaveAttribute('aria-hidden', 'true');
    expect(tile).toHaveClass(styles.icon, styles.success);
  });

  it('centres the content on request', () => {
    render(<ResultState title="Not found" align="center" data-testid="r" />);
    expect(screen.getByTestId('r')).toHaveClass(styles.center);
  });

  it('forwards a ref, DOM props and a class name to its root', () => {
    const ref = createRef<HTMLElement>();
    render(
      <ResultState
        ref={ref}
        title="Done"
        data-testid="result"
        className="consumer"
      />,
    );
    expect(ref.current).toBe(screen.getByTestId('result'));
    expect(ref.current).toHaveClass('consumer', styles.root);
    expect(ref.current).not.toHaveAttribute('role');
  });
});
