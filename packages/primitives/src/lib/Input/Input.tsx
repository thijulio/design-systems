import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
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
