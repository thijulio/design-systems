import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cx } from '../_util/style';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Flip to the danger outline. */
  invalid?: boolean;
}

/** Input — text control with a contract-driven focus ring. */
export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      className={cx(styles.input, invalid && styles.invalid, className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

/** Textarea — same skin as Input, auto-height with vertical resize. */
export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      className={cx(
        styles.input,
        styles.textarea,
        invalid && styles.invalid,
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  children?: ReactNode;
}

/** Select — native select with the Input skin and a custom chevron. */
export function Select({
  className,
  invalid,
  children,
  ...props
}: SelectProps) {
  return (
    <div className={styles.selectWrap}>
      <select
        className={cx(
          styles.input,
          styles.select,
          invalid && styles.invalid,
          className,
        )}
        aria-invalid={invalid || undefined}
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
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
