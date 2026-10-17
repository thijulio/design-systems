import { createRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ToggleButton } from './ToggleButton';
import styles from './ToggleButton.module.css';

describe('ToggleButton', () => {
  it('exposes its state with aria-pressed', () => {
    const { rerender } = render(<ToggleButton pressed={false}>Follow</ToggleButton>);
    expect(screen.getByRole('button', { name: 'Follow' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    rerender(<ToggleButton pressed>Follow</ToggleButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('reports the next state on press', () => {
    const Harness = () => {
      const [pressed, setPressed] = useState(false);
      return (
        <ToggleButton pressed={pressed} onPressedChange={setPressed}>
          Follow
        </ToggleButton>
      );
    };
    render(<Harness />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('lets onClick veto the change with preventDefault', () => {
    const onPressedChange = jest.fn();
    render(
      <ToggleButton
        pressed={false}
        onPressedChange={onPressedChange}
        onClick={(event) => event.preventDefault()}
      >
        Follow
      </ToggleButton>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onPressedChange).not.toHaveBeenCalled();
  });

  it('keeps the control radius by default and rounds fully as a pill', () => {
    const { rerender } = render(
      <ToggleButton pressed={false}>Cats</ToggleButton>,
    );
    const button = screen.getByRole('button', { name: 'Cats' });
    expect(button).toHaveClass(styles.toggle);
    expect(button).not.toHaveClass(styles.pill);
    rerender(
      <ToggleButton pressed shape="pill" className="extra">
        Cats
      </ToggleButton>,
    );
    expect(button).toHaveClass(styles.toggle, styles.pill, 'extra');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <ToggleButton ref={ref} pressed={false}>
        Follow
      </ToggleButton>,
    );
    expect(ref.current).toBe(screen.getByRole('button'));
  });
});
