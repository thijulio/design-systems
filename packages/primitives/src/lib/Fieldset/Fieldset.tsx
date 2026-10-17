import {
  forwardRef,
  useId,
  type FieldsetHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../_util/style';
import styles from './Fieldset.module.css';

export interface FieldsetProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** Group label. Required: a fieldset without a legend is unnamed. */
  legend: ReactNode;
  /** Help text under the legend; it describes the group. */
  hint?: ReactNode;
  /** Error text (`role="alert"`); it describes the group and marks it invalid. */
  error?: ReactNode;
  /** Keep the legend for assistive technology only. */
  legendHidden?: boolean;
  children?: ReactNode;
}

const present = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== '';

/** Fieldset — groups related controls under a legend, with hint and error. */
export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(
  function Fieldset(
    {
      legend,
      hint,
      error,
      legendHidden = false,
      className,
      children,
      id,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref,
  ) {
    const autoId = useId();
    const baseId = id ?? autoId;
    const hintId = `${baseId}-hint`;
    const errorId = `${baseId}-error`;
    const hasHint = present(hint);
    const hasError = present(error);
    const describedBy =
      cx(ariaDescribedBy, hasHint && hintId, hasError && errorId) || undefined;
    return (
      <fieldset
        ref={ref}
        id={id}
        aria-describedby={describedBy}
        aria-invalid={hasError ? true : undefined}
        {...props}
        className={cx(styles.fieldset, className)}
      >
        <legend
          className={cx(styles.legend, legendHidden && styles.visuallyHidden)}
        >
          {legend}
        </legend>
        {hasHint && (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        )}
        {children}
        {hasError && (
          <p id={errorId} role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </fieldset>
    );
  },
);
Fieldset.displayName = 'Fieldset';
