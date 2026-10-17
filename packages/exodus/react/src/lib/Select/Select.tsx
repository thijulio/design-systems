import { forwardRef } from 'react';
import { Select as PrimitiveSelect } from '@thijulio/primitives';
import type { SelectProps as PrimitiveSelectProps } from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';
import { cx } from '../_util/style';
import inputStyles from '../Input/Input.module.css';

/** `invalid` flips to the danger outline; `fullWidth` defaults to true. */
export type SelectProps = PrimitiveSelectProps;

/** Select — native select with the kit skin and a custom chevron. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, invalid, children, ...props }, ref) {
    return (
      <PrimitiveSelect
        {...props}
        ref={ref}
        invalid={invalid}
        className={cx(
          inputStyles.input,
          invalid && inputStyles.invalid,
          className,
        )}
      >
        {children}
      </PrimitiveSelect>
    );
  },
);

Select.displayName = 'Select';
