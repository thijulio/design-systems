import type { SelectHTMLAttributes, ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './Select.module.css';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Flip to the danger outline. */
  invalid?: boolean;
  children?: ReactNode;
}

/** Select — native select with the kit skin and a custom chevron. */
export function Select({
  className,
  invalid,
  children,
  ...props
}: SelectProps) {
  return (
    <div className={styles.wrap}>
      <select
        className={cx(styles.select, invalid && styles.invalid, className)}
        {...props}
      >
        {children}
      </select>
      <svg
        className={styles.chevron}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--n-500)"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
