import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Tooltip } from './Tooltip';
import styles from './Tooltip.module.css';

const glyph = <svg aria-hidden="true" data-testid="glyph" />;

describe('Tooltip', () => {
  it('renders a type=button trigger described by the tooltip', () => {
    render(
      <Tooltip content="Copies the link" aria-label="Share">
        {glyph}
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Share' });
    const tooltip = screen.getByRole('tooltip');
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    expect(trigger).toHaveAccessibleDescription('Copies the link');
    expect(tooltip).toHaveAttribute('data-state', 'closed');
    expect(tooltip).toHaveClass(styles.tooltip, styles.top);
  });

  it('opens on hover and closes when the pointer leaves', () => {
    render(<Tooltip content="Hint">{glyph}</Tooltip>);
    const root = screen.getByRole('button').parentElement as HTMLElement;
    fireEvent.mouseEnter(root);
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-state', 'open');
    fireEvent.mouseLeave(root);
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-state', 'closed');
  });

  it('opens on focus and closes on blur', () => {
    render(<Tooltip content="Hint">{glyph}</Tooltip>);
    const trigger = screen.getByRole('button');
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-state', 'open');
    fireEvent.blur(trigger);
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-state', 'closed');
  });

  it('dismisses on Escape until the trigger is entered again', () => {
    render(<Tooltip content="Hint">{glyph}</Tooltip>);
    const trigger = screen.getByRole('button');
    const tooltip = screen.getByRole('tooltip');
    fireEvent.focus(trigger);
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(tooltip).toHaveAttribute('data-state', 'closed');
    fireEvent.mouseEnter(trigger.parentElement as HTMLElement);
    expect(tooltip).toHaveAttribute('data-state', 'open');
  });

  it('can name an icon-only trigger instead of describing it', () => {
    render(
      <Tooltip content="Verified" relation="label" placement="bottom">
        {glyph}
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Verified' });
    expect(trigger).not.toHaveAttribute('aria-describedby');
    expect(screen.getByRole('tooltip')).toHaveClass(styles.bottom);
  });

  it('merges onto an asChild trigger and keeps its own description', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <>
        <span id="extra">Opens in place</span>
        <Tooltip ref={ref} content="Docs" asChild className="mine">
          <a href="/docs" aria-describedby="extra">
            Read
          </a>
        </Tooltip>
      </>,
    );
    const link = screen.getByRole('link', { name: 'Read' });
    const tooltip = screen.getByRole('tooltip');
    expect(link).toHaveAttribute('aria-describedby', `extra ${tooltip.id}`);
    expect(link).toHaveClass('mine');
    expect(link).not.toHaveAttribute('type');
    expect(ref.current).toBe(link);
  });

  it('forwards ref and native props to the button', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Tooltip ref={ref} content="Hint" data-testid="trigger" className="x">
        {glyph}
      </Tooltip>,
    );
    expect(ref.current).toBe(screen.getByTestId('trigger'));
    expect(ref.current).toHaveClass(styles.trigger, 'x');
  });
});
