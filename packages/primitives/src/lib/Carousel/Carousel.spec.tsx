import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Carousel } from './Carousel';
import styles from './Carousel.module.css';

function stubLayout(scrollWidth: number, clientWidth: number) {
  jest
    .spyOn(Element.prototype, 'scrollWidth', 'get')
    .mockReturnValue(scrollWidth);
  jest
    .spyOn(Element.prototype, 'clientWidth', 'get')
    .mockReturnValue(clientWidth);
}

describe('Carousel', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders labelled previous and next controls before the track', () => {
    render(
      <Carousel
        previousLabel="Previous slides"
        nextLabel="Next slides"
        data-testid="carousel"
      >
        <p>Slide</p>
      </Carousel>,
    );
    const root = screen.getByTestId('carousel');
    const previous = screen.getByRole('button', { name: 'Previous slides' });
    const next = screen.getByRole('button', { name: 'Next slides' });
    expect(Array.from(root.children)).toEqual([
      previous,
      next,
      screen.getByText('Slide').parentElement,
    ]);
    expect(previous).toHaveAttribute('type', 'button');
    expect(previous.querySelector('svg')).toHaveAttribute('aria-hidden');
  });

  describe('paged mode', () => {
    it('calls the handlers and puts the test ids on the controls', () => {
      const onPrevious = jest.fn();
      const onNext = jest.fn();
      render(
        <Carousel
          previousLabel="Previous"
          nextLabel="Next"
          onPrevious={onPrevious}
          onNext={onNext}
          previousTestId="prev"
          nextTestId="next"
        >
          <p>Page</p>
        </Carousel>,
      );
      fireEvent.click(screen.getByTestId('next'));
      fireEvent.click(screen.getByTestId('prev'));
      expect(onNext).toHaveBeenCalledTimes(1);
      expect(onPrevious).toHaveBeenCalledTimes(1);
      const track = screen.getByText('Page').parentElement;
      expect(track).toHaveClass(styles.track);
      expect(track).not.toHaveClass(styles.scroll);
      expect(track).not.toHaveAttribute('tabindex');
    });

    it('natively disables the controls the caller disables', () => {
      const onPrevious = jest.fn();
      render(
        <Carousel
          previousLabel="Previous"
          nextLabel="Next"
          onPrevious={onPrevious}
          onNext={jest.fn()}
          previousDisabled
        >
          <p>Page</p>
        </Carousel>,
      );
      const previous = screen.getByRole('button', { name: 'Previous' });
      expect(previous).toBeDisabled();
      fireEvent.click(previous);
      expect(onPrevious).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    });
  });

  describe('scroll mode', () => {
    it('scrolls the track by one view and tracks its edges', () => {
      stubLayout(900, 300);
      render(
        <Carousel previousLabel="Previous" nextLabel="Next" gap={4}>
          <p>One</p>
          <p>Two</p>
        </Carousel>,
      );
      const track = screen.getByText('One').parentElement as HTMLElement;
      expect(track).toHaveClass(styles.track, styles.scroll, styles.g4);
      expect(track).toHaveAttribute('tabindex', '0');
      const scrollBy = jest.fn();
      track.scrollBy = scrollBy;

      const previous = screen.getByRole('button', { name: 'Previous' });
      const next = screen.getByRole('button', { name: 'Next' });
      expect(previous).toBeDisabled();
      expect(next).toBeEnabled();

      fireEvent.click(next);
      expect(scrollBy).toHaveBeenCalledWith(
        expect.objectContaining({ left: 300 }),
      );

      act(() => {
        Object.defineProperty(track, 'scrollLeft', {
          configurable: true,
          value: 600,
        });
        track.dispatchEvent(new Event('scroll'));
      });
      expect(previous).toBeEnabled();
      expect(next).toBeDisabled();

      fireEvent.click(previous);
      expect(scrollBy).toHaveBeenLastCalledWith(
        expect.objectContaining({ left: -300 }),
      );
    });

    it('disables both controls when nothing overflows', () => {
      stubLayout(300, 300);
      render(
        <Carousel previousLabel="Previous" nextLabel="Next">
          <p>Only</p>
        </Carousel>,
      );
      expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });
  });

  it('forwards a ref, classes and DOM props', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Carousel
        ref={ref}
        previousLabel="Previous"
        nextLabel="Next"
        className="extra"
        trackClassName="grid"
        data-testid="carousel"
      >
        <p>Slide</p>
      </Carousel>,
    );
    expect(ref.current).toBe(screen.getByTestId('carousel'));
    expect(ref.current).toHaveClass(styles.carousel, 'extra');
    expect(screen.getByText('Slide').parentElement).toHaveClass('grid');
  });
});
