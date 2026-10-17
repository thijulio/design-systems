import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './SegmentedControl.module.css';

export interface SegmentedControlOption {
  value: string;
  label: ReactNode;
  /** `data-testid` for the option button. */
  testId?: string;
}

export interface SegmentedControlProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  /** Group name (`aria-label`). Required: the group has no visible label. */
  label: string;
  options: ReadonlyArray<SegmentedControlOption>;
  value: string;
  onChange: (value: string) => void;
  /** When set, a hidden input submits the value with a form. */
  name?: string;
}

/**
 * SegmentedControl — one choice among a few, as pressed/unpressed buttons in
 * a labelled group. The selection is exposed by `aria-pressed`, not colour.
 */
export const SegmentedControl = forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(function SegmentedControl(
  { label, options, value, onChange, name, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      {...props}
      className={cx(styles.segmented, className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            data-testid={option.testId}
            className={cx(styles.option, selected && styles.selected)}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
});
SegmentedControl.displayName = 'SegmentedControl';
