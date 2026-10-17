import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../_util/style';
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden';
import styles from './Spinner.module.css';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Announced status text, e.g. a translated "Loading…". Required: no default copy. */
  label: string;
  size?: 'sm' | 'md';
  /**
   * Show `label` beside the ring instead of only announcing it. The label
   * then takes the surrounding font and colour, so a text primitive around
   * the spinner sets its size and tone. Default false.
   */
  labelVisible?: boolean;
}

/** Spinner — indeterminate progress with a `status` live region. */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner(
    { label, size = 'md', labelVisible = false, className, ...props },
    ref,
  ) {
    return (
      <span
        ref={ref}
        role="status"
        {...props}
        className={cx(
          styles.spinner,
          labelVisible && styles.labelled,
          className,
        )}
      >
        <span
          className={cx(styles.ring, size === 'sm' ? styles.sm : styles.md)}
          aria-hidden="true"
        />
        {labelVisible ? (
          <span className={styles.label}>{label}</span>
        ) : (
          <VisuallyHidden>{label}</VisuallyHidden>
        )}
      </span>
    );
  },
);
Spinner.displayName = 'Spinner';
