import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label?: ReactNode;
}

/**
 * Checkbox — accent-filled custom box over a hidden native input (kept for
 * accessibility). Controlled: pass `checked` + `onChange`.
 */
export function Checkbox({
  checked,
  label,
  className,
  ...props
}: CheckboxProps) {
  return (
    <label className={cx(styles.label, className)}>
      <span
        className={cx(styles.box, checked && styles.checked)}
        aria-hidden="true"
      >
        {checked && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-on)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12l5 5 9-11" />
          </svg>
        )}
      </span>
      {label && <span className={styles.text}>{label}</span>}
      <input
        type="checkbox"
        className={styles.native}
        checked={checked}
        {...props}
      />
    </label>
  );
}
