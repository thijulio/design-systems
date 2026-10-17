import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './Rating.module.css';

export interface RatingProps extends HTMLAttributes<HTMLSpanElement> {
  value: number;
  /** Number of stars. */
  max?: number;
  /** Accessible reading, e.g. a translated "4.5 out of 5". Required: the stars are an image. */
  label: string;
  size?: 'sm' | 'md';
  /**
   * Optional visible figure after the stars (already formatted for the locale).
   * Rendered as a sibling of the image, so it stays readable text rather than
   * a presentational child of `role="img"`.
   */
  valueText?: ReactNode;
}

const STAR_PATH =
  'M12 2l2.9 6.26 6.9.55-5.2 4.48 1.58 6.71L12 16.9 5.82 20l1.58-6.71-5.2-4.48 6.9-.55L12 2z';

/**
 * Rating — read-only star rating, rounded down to the nearest half star. The
 * stars are one `role="img"` named by `label`; `valueText`, when given,
 * follows it as visible text. The root wrapper takes the ref and rest props.
 * Each instance gets its own gradient ids (`useId`), so many ratings on one
 * page never paint each other's partial fill.
 */
export const Rating = forwardRef<HTMLSpanElement, RatingProps>(function Rating(
  { value, max = 5, label, size = 'md', valueText, className, ...props },
  ref,
) {
  // useId output contains ':' or '«»'; keep url(#…) references plain.
  const idBase = `ds-rating-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const safeMax = Math.max(0, Math.floor(max));
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const fullStars = Math.floor(clamped);
  const showHalf = clamped - fullStars >= 0.5;

  return (
    <span ref={ref} {...props} className={cx(styles.rating, className)}>
      <span role="img" aria-label={label} className={styles.stars}>
        {Array.from({ length: safeMax }, (_, index) => {
          const fill =
            index < fullStars ? 1 : index === fullStars && showHalf ? 0.5 : 0;
          const gradientId = `${idBase}-${index}`;
          return (
            <svg
              key={index}
              viewBox="0 0 24 24"
              className={cx(styles.star, size === 'sm' ? styles.sm : styles.md)}
              aria-hidden="true"
              focusable="false"
              data-fill={fill}
            >
              {fill === 0.5 && (
                <defs>
                  <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop
                      offset="50%"
                      stopColor="currentColor"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
              )}
              <path
                d={STAR_PATH}
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinejoin="round"
                fill={
                  fill === 1
                    ? 'currentColor'
                    : fill === 0
                      ? 'none'
                      : `url(#${gradientId})`
                }
              />
            </svg>
          );
        })}
      </span>
      {valueText !== undefined && valueText !== null && valueText !== '' && (
        <span className={styles.valueText}>{valueText}</span>
      )}
    </span>
  );
});
Rating.displayName = 'Rating';
