import { forwardRef, type HTMLAttributes } from 'react';
import { cx, type StyleWithVars } from '../_util/style';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'role'
> {
  /** Accessible name, e.g. a translated "Upload progress". Required. */
  label: string;
  /**
   * Current value, from 0 to `max`; out-of-range values are clamped. Omit
   * it (or pass null) for an indeterminate bar: work is under way but its
   * extent is unknown.
   */
  value?: number | null;
  /** Upper bound, above 0 (anything else falls back to 100). Default 100. */
  max?: number;
  /**
   * Formats the current value, e.g. as "3 of 12 MB" (all copy is the
   * caller's). The text is shown beside the bar and announced as
   * `aria-valuetext`. Without it nothing is shown, and assistive technology
   * reads the value. Not called while indeterminate.
   */
  formatValue?: (value: number, max: number) => string;
}

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

/**
 * ProgressBar — a `progressbar` showing how far a task has got. The test
 * id, `aria-*` and `className` land on the progressbar root.
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(
    { label, value, max = 100, formatValue, className, style, ...props },
    ref,
  ) {
    const bound = max > 0 ? max : 100;
    const current = value == null ? null : clamp(value, bound);
    const valueText =
      current !== null && formatValue ? formatValue(current, bound) : undefined;
    const vars: StyleWithVars = { ...style };
    if (current !== null) {
      vars['--ds-progress-value'] = `${(current / bound) * 100}%`;
    }
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={bound}
        aria-valuenow={current ?? undefined}
        aria-valuetext={valueText}
        {...props}
        style={vars}
        className={cx(
          styles.progress,
          current === null && styles.indeterminate,
          className,
        )}
      >
        <span className={styles.track} aria-hidden="true">
          <span className={styles.fill} />
        </span>
        {valueText !== undefined ? (
          <span className={styles.value} aria-hidden="true">
            {valueText}
          </span>
        ) : null}
      </div>
    );
  },
);
ProgressBar.displayName = 'ProgressBar';
