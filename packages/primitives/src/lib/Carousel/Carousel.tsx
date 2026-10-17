import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Icon } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import { gapClass, type Space } from '../_util/space';
import { cx } from '../_util/style';
import styles from './Carousel.module.css';

export interface CarouselProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The track content: slides in scroll mode, any block when paged. */
  children: ReactNode;
  /** Accessible name of the icon-only previous control. Required. */
  previousLabel: string;
  /** Accessible name of the icon-only next control. Required. */
  nextLabel: string;
  /**
   * Paged mode. With `onPrevious` or `onNext` the controls call them and the
   * caller swaps the track content; without either, the track scrolls
   * horizontally and the controls scroll it by one view.
   */
  onPrevious?: () => void;
  onNext?: () => void;
  /** Natively disables the previous control. Scroll mode also does at start. */
  previousDisabled?: boolean;
  /** Natively disables the next control. Scroll mode also does at the end. */
  nextDisabled?: boolean;
  /** `data-testid` for the previous control. */
  previousTestId?: string;
  /** `data-testid` for the next control. */
  nextTestId?: string;
  /** Gap between slides in scroll mode. Default 3. */
  gap?: Space;
  /** Extra class on the track. */
  trackClassName?: string;
}

interface Edges {
  atStart: boolean;
  atEnd: boolean;
}

function reducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Carousel — a track with previous and next controls overlaid on its sides.
 * It scrolls by one view, or pages when the caller owns the position.
 */
export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(
    {
      children,
      previousLabel,
      nextLabel,
      onPrevious,
      onNext,
      previousDisabled = false,
      nextDisabled = false,
      previousTestId,
      nextTestId,
      gap = 3,
      trackClassName,
      className,
      ...props
    },
    ref,
  ) {
    const paged = onPrevious !== undefined || onNext !== undefined;
    const trackRef = useRef<HTMLDivElement>(null);
    const [edges, setEdges] = useState<Edges>({
      atStart: true,
      atEnd: false,
    });

    const measure = useCallback(() => {
      const track = trackRef.current;
      if (!track) return;
      const max = track.scrollWidth - track.clientWidth;
      // RTL tracks report a negative scrollLeft.
      const offset = Math.abs(track.scrollLeft);
      setEdges({ atStart: offset <= 1, atEnd: offset >= max - 1 });
    }, []);

    useEffect(() => {
      const track = trackRef.current;
      if (paged || !track) return undefined;
      measure();
      track.addEventListener('scroll', measure, { passive: true });
      const observer =
        typeof ResizeObserver === 'undefined'
          ? undefined
          : new ResizeObserver(measure);
      observer?.observe(track);
      return () => {
        track.removeEventListener('scroll', measure);
        observer?.disconnect();
      };
    }, [paged, measure]);

    const scrollByView = (direction: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      const rtl = getComputedStyle(track).direction === 'rtl';
      const left = direction * track.clientWidth * (rtl ? -1 : 1);
      if (typeof track.scrollBy === 'function') {
        const behavior = reducedMotion() ? 'auto' : 'smooth';
        track.scrollBy({ left, behavior });
      } else {
        track.scrollLeft += left;
      }
    };

    const handlePrevious = paged ? onPrevious : () => scrollByView(-1);
    const handleNext = paged ? onNext : () => scrollByView(1);
    const disablePrevious = previousDisabled || (!paged && edges.atStart);
    const disableNext = nextDisabled || (!paged && edges.atEnd);

    return (
      <div ref={ref} {...props} className={cx(styles.carousel, className)}>
        <IconButton
          label={previousLabel}
          icon={<Icon name="chevron-left" size={16} />}
          variant="secondary"
          size="sm"
          className={cx(styles.control, styles.previous)}
          onClick={handlePrevious}
          disabled={disablePrevious}
          data-testid={previousTestId}
        />
        <IconButton
          label={nextLabel}
          icon={<Icon name="chevron-right" size={16} />}
          variant="secondary"
          size="sm"
          className={cx(styles.control, styles.next)}
          onClick={handleNext}
          disabled={disableNext}
          data-testid={nextTestId}
        />
        <div
          ref={trackRef}
          // A scrolling track takes focus so the keyboard can scroll it.
          tabIndex={paged ? undefined : 0}
          className={cx(
            styles.track,
            !paged && styles.scroll,
            !paged && gapClass(styles, gap),
            trackClassName,
          )}
        >
          {children}
        </div>
      </div>
    );
  },
);
Carousel.displayName = 'Carousel';
