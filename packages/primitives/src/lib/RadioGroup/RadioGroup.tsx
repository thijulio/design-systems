import {
  forwardRef,
  useId,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { cx } from '../_util/style';
import { Fieldset, type FieldsetProps } from '../Fieldset/Fieldset';
import styles from './RadioGroup.module.css';

export type RadioGroupVariant = 'default' | 'card';

export interface RadioOption {
  value: string;
  label: ReactNode;
  /** Extra line under the label; it describes the radio. */
  description?: ReactNode;
  /** @deprecated Use `description`. */
  hint?: ReactNode;
  disabled?: boolean;
  /** `data-testid` for the radio input. */
  testId?: string;
  /** `data-testid` for the option's `<label>`, which wraps the radio. */
  labelTestId?: string;
}

export interface RadioGroupProps
  extends Omit<
    FieldsetProps,
    'onChange' | 'children' | 'defaultValue' | 'legend'
  > {
  /** Shared `name` of the radio inputs. */
  name: string;
  legend: ReactNode;
  options: ReadonlyArray<RadioOption>;
  /** Controlled selection. */
  value?: string;
  /** Uncontrolled initial selection. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  orientation?: 'vertical' | 'horizontal';
  /**
   * `card` draws each option as a bordered block: the whole block is the
   * label, so it is the click target, and the checked one is highlighted.
   */
  variant?: RadioGroupVariant;
}

/** RadioGroup — single choice among options, as native radios in a fieldset. */
export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  function RadioGroup(
    {
      name,
      legend,
      options,
      value,
      defaultValue,
      onChange,
      orientation = 'vertical',
      variant = 'default',
      className,
      ...props
    },
    ref,
  ) {
    const baseId = useId();
    const controlled = value !== undefined;
    const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
      onChange?.(event.target.value);
    return (
      <Fieldset ref={ref} legend={legend} {...props} className={className}>
        <div
          className={cx(
            styles.options,
            orientation === 'horizontal' ? styles.horizontal : styles.vertical,
          )}
        >
          {options.map((option, index) => {
            const inputId = `${baseId}-${index}`;
            const description = option.description ?? option.hint;
            const hintId = description ? `${inputId}-hint` : undefined;
            // With a description inside the label, name the radio by its
            // label line only; the description is its description.
            const labelId = description ? `${inputId}-label` : undefined;
            return (
              <label
                key={option.value}
                htmlFor={inputId}
                data-testid={option.labelTestId}
                className={cx(
                  styles.option,
                  variant === 'card' && styles.card,
                  option.disabled && styles.disabled,
                )}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={name}
                  value={option.value}
                  disabled={option.disabled}
                  data-testid={option.testId}
                  aria-labelledby={labelId}
                  aria-describedby={hintId}
                  className={styles.input}
                  {...(controlled
                    ? { checked: value === option.value, onChange: handleChange }
                    : {
                        defaultChecked: defaultValue === option.value,
                        onChange: onChange ? handleChange : undefined,
                      })}
                />
                <span className={styles.text}>
                  <span id={labelId} className={styles.label}>
                    {option.label}
                  </span>
                  {description && (
                    <span id={hintId} className={styles.hint}>
                      {description}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </Fieldset>
    );
  },
);
RadioGroup.displayName = 'RadioGroup';
