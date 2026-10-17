import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cx } from '../_util/style';
import styles from './Input.module.css';

interface ControlProps {
  /** Flip to the danger outline and announce `aria-invalid`. */
  invalid?: boolean;
  /** Fill the container width (default); `false` keeps the intrinsic width. */
  fullWidth?: boolean;
}

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>, ControlProps {}

/** Input — text control with a contract-driven focus ring. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, fullWidth = true, ...props },
  ref,
) {
  return (
    <input
      aria-invalid={invalid || undefined}
      {...props}
      ref={ref}
      className={cx(
        styles.input,
        !fullWidth && styles.intrinsic,
        invalid && styles.invalid,
        className,
      )}
    />
  );
});

Input.displayName = 'Input';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>, ControlProps {}

/** Textarea — same skin as Input, auto-height with vertical resize. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, fullWidth = true, ...props }, ref) {
    return (
      <textarea
        aria-invalid={invalid || undefined}
        {...props}
        ref={ref}
        className={cx(
          styles.input,
          styles.textarea,
          !fullWidth && styles.intrinsic,
          invalid && styles.invalid,
          className,
        )}
      />
    );
  },
);

Textarea.displayName = 'Textarea';

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>, ControlProps {
  children?: ReactNode;
}

/**
 * Select — native select with the Input skin and a custom chevron. The ref
 * points at the `<select>`; the wrapper only positions the chevron.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { className, invalid, fullWidth = true, children, ...props },
    ref,
  ) {
    return (
      <div className={cx(styles.selectWrap, !fullWidth && styles.inlineWrap)}>
        <select
          aria-invalid={invalid || undefined}
          {...props}
          ref={ref}
          className={cx(
            styles.input,
            styles.select,
            !fullWidth && styles.intrinsic,
            invalid && styles.invalid,
            className,
          )}
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
  },
);

Select.displayName = 'Select';
