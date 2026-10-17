import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { fieldErrorId, fieldHintId } from '../_util/fieldIds';
import { cx } from '../_util/style';
import styles from './Field.module.css';

export interface FieldProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** Visible `<label htmlFor>`. Omit only when the control is labelled otherwise. */
  label?: ReactNode;
  /** Show the `*` marker (hidden from assistive tech; mark the control `required`). */
  requiredMarker?: boolean;
  /** Helper text below the control, id `fieldHintId(htmlFor)` (hidden when `error` is set). */
  hint?: ReactNode;
  /** Error text below the control, id `fieldErrorId(htmlFor)`, announced via `role="alert"`. */
  error?: ReactNode;
  /** id of the control: wires the label and names the hint/error ids. */
  htmlFor?: string;
  children?: ReactNode;
}

/**
 * Field — label + control + hint/error for a form control. The label wraps
 * only its own text, so hint and error never leak into the control's
 * accessible name. Field does not touch the control: point its
 * `aria-describedby` at `fieldDescribedBy(id, { error, hint })` and set
 * `invalid` on it, or use `InputField` / `SelectField` / `TextareaField`,
 * which do that wiring.
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  {
    label,
    requiredMarker,
    hint,
    error,
    htmlFor,
    children,
    className,
    ...props
  },
  ref,
) {
  return (
    <div {...props} ref={ref} className={cx(styles.field, className)}>
      {label && (
        <label htmlFor={htmlFor} className={styles.label}>
          {label}
          {requiredMarker && (
            <span className={styles.required} aria-hidden="true">
              {' *'}
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <span
          id={htmlFor ? fieldErrorId(htmlFor) : undefined}
          role="alert"
          className={styles.error}
        >
          {error}
        </span>
      ) : hint ? (
        <span
          id={htmlFor ? fieldHintId(htmlFor) : undefined}
          className={styles.hint}
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
});

Field.displayName = 'Field';
