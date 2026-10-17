import { forwardRef } from 'react';
import {
  Input as PrimitiveInput,
  Textarea as PrimitiveTextarea,
} from '@thijulio/primitives';
import type {
  InputProps as PrimitiveInputProps,
  TextareaProps as PrimitiveTextareaProps,
} from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';
import { cx } from '../_util/style';
import styles from './Input.module.css';

/** `invalid` flips to the danger outline; `fullWidth` defaults to true. */
export type InputProps = PrimitiveInputProps;

/** Input — text control with a theme-driven focus ring. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <PrimitiveInput
      {...props}
      ref={ref}
      invalid={invalid}
      className={cx(styles.input, invalid && styles.invalid, className)}
    />
  );
});

Input.displayName = 'Input';

export type TextareaProps = PrimitiveTextareaProps;

/** Textarea — same skin as Input, auto-height with vertical resize. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, ...props }, ref) {
    return (
      <PrimitiveTextarea
        {...props}
        ref={ref}
        invalid={invalid}
        className={cx(
          styles.input,
          styles.textarea,
          invalid && styles.invalid,
          className,
        )}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
