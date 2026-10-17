import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { IconButton } from './IconButton';
import styles from './IconButton.module.css';

const glyph = <svg data-testid="glyph" />;

describe('IconButton', () => {
  it('is a type=button named by its label', () => {
    render(<IconButton label="Close" icon={glyph} />);
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button).toHaveAttribute('type', 'button');
    expect(screen.getByTestId('glyph').parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('maps size and variant', () => {
    render(
      <IconButton label="Delete" icon={glyph} size="lg" variant="danger" />,
    );
    expect(screen.getByRole('button')).toHaveClass(styles.lg, styles.danger);
  });

  it('forwards clicks', () => {
    const onClick = jest.fn();
    render(<IconButton label="Share" icon={glyph} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('stays focusable but refuses presses while loading', () => {
    const onClick = jest.fn();
    render(
      <IconButton label="Save" icon={glyph} isLoading onClick={onClick} />,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards ref and native disabled', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<IconButton ref={ref} label="Edit" icon={glyph} disabled />);
    expect(ref.current).toBe(screen.getByRole('button'));
    expect(ref.current).toBeDisabled();
  });
});
