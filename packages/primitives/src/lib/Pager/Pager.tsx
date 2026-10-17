import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './Pager.module.css';

export interface PagerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'aria-label'
> {
  /** Accessible name of the group (`aria-label`), e.g. what is paged. */
  label: string;
  /** Visible text of the previous control. There is no default copy. */
  previousLabel: ReactNode;
  /** Visible text of the next control. There is no default copy. */
  nextLabel: ReactNode;
  onPrevious: () => void;
  onNext: () => void;
  /** Natively disables the previous control (first page). */
  previousDisabled?: boolean;
  /** Natively disables the next control (last page). */
  nextDisabled?: boolean;
  /**
   * The current position, shown between the controls and announced politely
   * when it changes. Without it a decorative divider separates them.
   */
  current?: ReactNode;
  /** `data-testid` for the previous control. */
  previousTestId?: string;
  /** `data-testid` for the next control. */
  nextTestId?: string;
}

/**
 * Pager — previous and next text controls around an optional current label,
 * in a labelled group. Every string is supplied by the caller.
 */
export const Pager = forwardRef<HTMLDivElement, PagerProps>(function Pager(
  {
    label,
    previousLabel,
    nextLabel,
    onPrevious,
    onNext,
    previousDisabled = false,
    nextDisabled = false,
    current,
    previousTestId,
    nextTestId,
    className,
    ...props
  },
  ref,
) {
  const hasCurrent =
    current !== undefined && current !== null && current !== '';
  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      {...props}
      className={cx(styles.pager, className)}
    >
      <button
        type="button"
        className={styles.control}
        onClick={onPrevious}
        disabled={previousDisabled}
        data-testid={previousTestId}
      >
        {previousLabel}
      </button>
      {hasCurrent ? (
        <span className={styles.current} aria-live="polite" aria-atomic="true">
          {current}
        </span>
      ) : (
        <span className={styles.separator} aria-hidden="true" />
      )}
      <button
        type="button"
        className={styles.control}
        onClick={onNext}
        disabled={nextDisabled}
        data-testid={nextTestId}
      >
        {nextLabel}
      </button>
    </div>
  );
});
Pager.displayName = 'Pager';
