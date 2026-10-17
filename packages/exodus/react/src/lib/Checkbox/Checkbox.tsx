import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { fieldHintId } from '@thijulio/primitives';
import { cx } from '../_util/style';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  /**
   * Visible text beside the box, and the input's accessible name. Omit it
   * only when the box is named otherwise (`aria-label`, `aria-labelledby`).
   */
  label?: ReactNode;
  /**
   * Secondary text under the label. It describes the input
   * (`aria-describedby`, id `fieldHintId(id)`) and never names it: with a
   * `label` it sits inside the root `<label>` (so it toggles the box too) and
   * the name is the label line alone; without one it sits outside the
   * `<label>`, so name the box with `aria-label` or `aria-labelledby`.
   */
  description?: ReactNode;
  /**
   * Box position against the text: `center` (default) for a one-line label,
   * `start` to hold it at the top of a label that wraps or has a description.
   */
  align?: 'center' | 'start';
  /**
   * `data-testid` for the root: the `<label>`, or a `<span>` when there is a
   * description and no label (rest props land on the input).
   */
  labelTestId?: string;
}

/**
 * Checkbox — accent-filled custom box drawn from the native input's own
 * `:checked` state, so it works controlled (`checked` + `onChange`) and
 * uncontrolled (`defaultChecked`, form reset). The native input stays in the
 * accessibility tree (visually hidden, never 0×0) and drives the focus ring.
 * `className` styles the root (see `labelTestId`); the ref points at the
 * input.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { label, description, align = 'center', labelTestId, className, ...props },
    ref,
  ) {
    const generatedId = useId();
    const baseId = props.id ?? generatedId;
    const descriptionId = description ? fieldHintId(baseId) : undefined;
    // With a description inside the label, name the input by its label
    // line only; the description is its description.
    const labelId = description && label ? `${baseId}-label` : undefined;
    const describedBy =
      [descriptionId, props['aria-describedby']].filter(Boolean).join(' ') ||
      undefined;
    const text = label && (
      <span id={labelId} className={styles.text}>
        {label}
      </span>
    );
    const rootClassName = cx(
      styles.label,
      align === 'start' && styles.start,
      className,
    );
    const control = (
      <span className={styles.control}>
        <input
          aria-labelledby={labelId}
          {...props}
          aria-describedby={describedBy}
          ref={ref}
          type="checkbox"
          className={styles.native}
        />
        <span className={styles.box} aria-hidden="true">
          <svg
            className={styles.check}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12l5 5 9-11" />
          </svg>
        </span>
      </span>
    );
    const descriptionText = description && (
      <span id={descriptionId} className={styles.description}>
        {description}
      </span>
    );

    // Inside a <label>, the description would become the input's name, so
    // without a label only the box is wrapped and the description sits beside
    // it.
    if (description && !label) {
      return (
        <span
          className={cx(rootClassName, styles.unlabelled)}
          data-testid={labelTestId}
        >
          <label className={styles.boxLabel}>{control}</label>
          <span className={styles.body}>{descriptionText}</span>
        </span>
      );
    }

    return (
      <label className={rootClassName} data-testid={labelTestId}>
        {control}
        {description ? (
          <span className={styles.body}>
            {text}
            {descriptionText}
          </span>
        ) : (
          text
        )}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
