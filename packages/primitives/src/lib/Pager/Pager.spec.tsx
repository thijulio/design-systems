import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Pager } from './Pager';
import styles from './Pager.module.css';

const noop = () => undefined;

describe('Pager', () => {
  it('renders a labelled group with previous and next buttons', () => {
    render(
      <Pager
        label="Results pages"
        previousLabel="Previous"
        nextLabel="Next"
        onPrevious={noop}
        onNext={noop}
      />,
    );
    const group = screen.getByRole('group', { name: 'Results pages' });
    const buttons = screen.getAllByRole('button');
    expect(buttons.map((button) => button.textContent)).toEqual([
      'Previous',
      'Next',
    ]);
    for (const button of buttons) {
      expect(group).toContainElement(button);
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toBeEnabled();
    }
  });

  it('runs the handlers and puts the test ids on the buttons', () => {
    const onPrevious = jest.fn();
    const onNext = jest.fn();
    render(
      <Pager
        label="Weeks"
        previousLabel="Prev"
        nextLabel="Next"
        onPrevious={onPrevious}
        onNext={onNext}
        previousTestId="prev"
        nextTestId="next"
      />,
    );
    fireEvent.click(screen.getByTestId('prev'));
    fireEvent.click(screen.getByTestId('next'));
    fireEvent.click(screen.getByTestId('next'));
    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(2);
  });

  it('natively disables either end', () => {
    const onPrevious = jest.fn();
    render(
      <Pager
        label="Weeks"
        previousLabel="Prev"
        nextLabel="Next"
        onPrevious={onPrevious}
        onNext={noop}
        previousDisabled
      />,
    );
    const previous = screen.getByRole('button', { name: 'Prev' });
    expect(previous).toBeDisabled();
    fireEvent.click(previous);
    expect(onPrevious).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('shows the current label as a polite region between the buttons', () => {
    render(
      <Pager
        label="Pages"
        previousLabel="Previous"
        nextLabel="Next"
        onPrevious={noop}
        onNext={noop}
        current="Page 2 of 5"
      />,
    );
    const current = screen.getByText('Page 2 of 5');
    expect(current).toHaveAttribute('aria-live', 'polite');
    expect(current).toHaveAttribute('aria-atomic', 'true');
    expect(current.previousElementSibling).toBe(
      screen.getByRole('button', { name: 'Previous' }),
    );
    expect(current.nextElementSibling).toBe(
      screen.getByRole('button', { name: 'Next' }),
    );
  });

  it('hides the divider shown without a current label', () => {
    render(
      <Pager
        label="Pages"
        previousLabel="Previous"
        nextLabel="Next"
        onPrevious={noop}
        onNext={noop}
        data-testid="pager"
      />,
    );
    const divider = screen
      .getByTestId('pager')
      .querySelector(`.${styles.separator}`);
    expect(divider).toHaveAttribute('aria-hidden', 'true');
    expect(divider).toBeEmptyDOMElement();
  });

  it('forwards a ref, a class and DOM props to its root', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Pager
        ref={ref}
        label="Pages"
        previousLabel="Previous"
        nextLabel="Next"
        onPrevious={noop}
        onNext={noop}
        className="extra"
        data-testid="pager"
      />,
    );
    expect(ref.current).toBe(screen.getByTestId('pager'));
    expect(ref.current).toHaveClass(styles.pager, 'extra');
  });
});
