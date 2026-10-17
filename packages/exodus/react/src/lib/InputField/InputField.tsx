import { forwardRef, useId, type ReactNode } from 'react';
import { fieldDescribedBy } from '@thijulio/primitives';
import { Field } from '../Field/Field';
import {
  Input,
  Textarea,
  type InputProps,
  type TextareaProps,
} from '../Input/Input';
import { Select, type SelectProps } from '../Select/Select';

/** The Field frame props every labelled control takes. */
export interface FieldFrameProps {
  /**
   * Visible `<label htmlFor>` holding only this text. Omit it only when the
   * control is named otherwise (`aria-label`): then no `<label>` renders.
   */
  label?: ReactNode;
  /** Help text below the control, id `fieldHintId(id)`; describes it. */
  hint?: ReactNode;
  /**
   * Error text, id `fieldErrorId(id)`, `role="alert"`. Replaces the hint as
   * the description and sets `aria-invalid` and the danger outline.
   */
  error?: ReactNode;
  /** Show the Field's decorative `*`. Set `required` for the constraint itself. */
  requiredMarker?: boolean;
  /** Class for the field root (the node a parent layout positions); `className` styles the control. */
  wrapperClassName?: string;
}

/**
 * The control id: `id`, else generated. Never `name`: names repeat (two forms
 * with an `email` field, radio-like groups), and a shared id points every
 * label and description at the first control.
 */
function useControlId(id: string | undefined) {
  const generatedId = useId();
  return id ?? generatedId;
}

/**
 * The aria wiring a labelled control gets. Spread before the caller's props,
 * so an explicit `aria-describedby` or `aria-invalid` still wins.
 */
function controlWiring(controlId: string, error: ReactNode, hint: ReactNode) {
  return {
    id: controlId,
    invalid: Boolean(error),
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': fieldDescribedBy(controlId, { error, hint }),
  };
}

export interface InputFieldProps
  extends Omit<InputProps, 'invalid'>, FieldFrameProps {}

/**
 * InputField — an `Input` inside a `Field`: a `<div>` root, a label holding
 * only the label text, then the hint (`${id}-hint`) or the `role="alert"`
 * error (`${id}-error`) outside the label. The control is described by one of
 * them. Rest props and the ref land on the `<input>`.
 */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(
    { label, hint, error, requiredMarker, wrapperClassName, id, ...props },
    ref,
  ) {
    const controlId = useControlId(id);
    return (
      <Field
        htmlFor={controlId}
        label={label}
        hint={hint}
        error={error}
        required={requiredMarker}
        className={wrapperClassName}
      >
        <Input
          {...controlWiring(controlId, error, hint)}
          {...props}
          ref={ref}
        />
      </Field>
    );
  },
);

InputField.displayName = 'InputField';

export interface SelectFieldProps
  extends Omit<SelectProps, 'invalid'>, FieldFrameProps {}

/** SelectField — a native `Select` (with `<option>` children) inside a `Field`; same wiring as `InputField`. */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(
    { label, hint, error, requiredMarker, wrapperClassName, id, ...props },
    ref,
  ) {
    const controlId = useControlId(id);
    return (
      <Field
        htmlFor={controlId}
        label={label}
        hint={hint}
        error={error}
        required={requiredMarker}
        className={wrapperClassName}
      >
        <Select
          {...controlWiring(controlId, error, hint)}
          {...props}
          ref={ref}
        />
      </Field>
    );
  },
);

SelectField.displayName = 'SelectField';

export interface TextareaFieldProps
  extends Omit<TextareaProps, 'invalid'>, FieldFrameProps {}

/** TextareaField — a `Textarea` inside a `Field`; same wiring as `InputField`. */
export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(function TextareaField(
  { label, hint, error, requiredMarker, wrapperClassName, id, ...props },
  ref,
) {
  const controlId = useControlId(id);
  return (
    <Field
      htmlFor={controlId}
      label={label}
      hint={hint}
      error={error}
      required={requiredMarker}
      className={wrapperClassName}
    >
      <Textarea
        {...controlWiring(controlId, error, hint)}
        {...props}
        ref={ref}
      />
    </Field>
  );
});

TextareaField.displayName = 'TextareaField';
