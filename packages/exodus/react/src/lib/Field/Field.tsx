import type { ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './Field.module.css';

export interface FieldProps {
  label?: ReactNode;
  required?: boolean;
  /** Helper text shown below the control (hidden when `error` is set). */
  hint?: ReactNode;
  /** Error text shown below the control, in danger colour. */
  error?: ReactNode;
  htmlFor?: string;
  children?: ReactNode;
  className?: string;
}

/** Field — label + required marker + hint/error wrapper for a form control. */
export function Field({
  label,
  required,
  hint,
  error,
  htmlFor,
  children,
  className,
}: FieldProps) {
  return (
    <label htmlFor={htmlFor} className={cx(styles.field, className)}>
      {label && (
        <span className={styles.label}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className={styles.error}>{error}</span>
      ) : hint ? (
        <span className={styles.hint}>{hint}</span>
      ) : null}
    </label>
  );
}
