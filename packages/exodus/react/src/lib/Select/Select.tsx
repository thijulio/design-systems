import type { SelectHTMLAttributes, ReactNode } from 'react';
import { Select as PrimitiveSelect } from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';
import { cx } from '../_util/style';
import inputStyles from '../Input/Input.module.css';

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
    <PrimitiveSelect
      invalid={invalid}
      className={cx(
        inputStyles.input,
        invalid && inputStyles.invalid,
        className,
      )}
      {...props}
    >
      {children}
    </PrimitiveSelect>
  );
}
