import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../_util/style';
import styles from './HoneypotField.module.css';

export interface HoneypotFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'name' | 'tabIndex' | 'autoComplete' | 'hidden' | 'aria-hidden'
> {
  /** The field name the server checks; a filled value marks a bot. */
  name: string;
  /**
   * Label text for bots (`<label htmlFor>`), e.g. "Website". Required: no
   * default copy. People never see or hear it.
   */
  label: ReactNode;
  /** Class for the root; `className` lands on the native input. */
  wrapperClassName?: string;
}

/**
 * HoneypotField — a form trap. A labelled text input placed off-screen (not
 * `display:none`, which some bots skip), outside the tab order
 * (`tabIndex=-1`), with autofill off, and hidden from assistive technology
 * by `aria-hidden` on the root. A person leaves it empty; a value means a
 * bot, and the server should reject the submission. Rest props (`value`,
 * `onChange`, `data-testid`…) and the ref land on the input. The id is `id`,
 * else generated.
 */
export const HoneypotField = forwardRef<HTMLInputElement, HoneypotFieldProps>(
  function HoneypotField(
    { name, label, wrapperClassName, className, id, ...props },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div aria-hidden="true" className={cx(styles.honeypot, wrapperClassName)}>
        <label htmlFor={inputId}>{label}</label>
        <input
          ref={ref}
          {...props}
          id={inputId}
          type="text"
          name={name}
          tabIndex={-1}
          autoComplete="off"
          className={className}
        />
      </div>
    );
  },
);
HoneypotField.displayName = 'HoneypotField';
