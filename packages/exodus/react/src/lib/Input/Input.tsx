import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import {
  Input as PrimitiveInput,
  Textarea as PrimitiveTextarea,
} from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';
import { cx } from '../_util/style';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Flip to the danger outline. */
  invalid?: boolean;
}

/** Input — text control with a theme-driven focus ring. */
export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <PrimitiveInput
      invalid={invalid}
      className={cx(styles.input, invalid && styles.invalid, className)}
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
    <PrimitiveTextarea
      invalid={invalid}
      className={cx(
        styles.input,
        styles.textarea,
        invalid && styles.invalid,
        className,
      )}
      {...props}
    />
  );
}
