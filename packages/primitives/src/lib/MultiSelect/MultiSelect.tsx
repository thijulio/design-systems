import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { composeRefs } from '../_util/refs';
import { cx } from '../_util/style';
import { Button } from '../Button/Button';
import styles from './MultiSelect.module.css';

export interface MultiSelectOption {
  label: string;
  value: string;
}

export interface MultiSelectProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'children'
> {
  /** Names the whole control (a `group`); the trigger keeps the summary as its own name. */
  label?: ReactNode;
  /** Help text, linked to the trigger with `aria-describedby`. */
  hint?: ReactNode;
  /** Trigger text while nothing is selected. Required: no default copy. */
  placeholder: string;
  /** Text of the button that closes the popover. Required: no default copy. */
  doneLabel: string;
  options: MultiSelectOption[];
  /** Selected option values (controlled). */
  value: string[];
  onChange: (value: string[]) => void;
  /**
   * Trigger text for a selection, given the selected labels in selection
   * order, e.g. a translated "Cats, Dogs +1 more". Required: no default copy.
   */
  formatSummary: (selectedLabels: string[]) => string;
}

/**
 * MultiSelect — a trigger button summarising the selection, opening a popover
 * of checkboxes and a done button. A pointer press outside, or Escape, closes
 * it. The
 * label names a `group` around the control: a `<label>` cannot name the
 * popover's checkboxes, and pointing it at the trigger would replace the
 * summary the trigger is named by. Rest props and the ref land on the root.
 */
export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  function MultiSelect(
    {
      label,
      hint,
      placeholder,
      doneLabel,
      options,
      value,
      onChange,
      formatSummary,
      className,
      ...props
    },
    ref,
  ) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const setRefs = useMemo(() => composeRefs(containerRef, ref), [ref]);
    const labelId = useId();
    const hintId = useId();
    const popoverId = useId();
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Only while open: a closed control has nothing to close.
    useEffect(() => {
      if (!isOpen) return undefined;
      const handleClickOutside = (event: MouseEvent) => {
        if (!containerRef.current?.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // The done button unmounts with the popover, so focus goes back to the
    // trigger instead of falling to the body.
    const close = () => {
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    // Escape closes the popover from anywhere inside the control and hands
    // focus back to the trigger, as a disclosure should.
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      props.onKeyDown?.(event);
      if (event.defaultPrevented || !isOpen || event.key !== 'Escape') return;
      event.preventDefault();
      close();
    };

    const toggleValue = (optionValue: string) => {
      if (value.includes(optionValue)) {
        onChange(value.filter((item) => item !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    };

    const summary = useMemo(() => {
      if (!value.length) return placeholder;
      const selectedLabels = value
        .map(
          (selected) =>
            options.find((option) => option.value === selected)?.label,
        )
        .filter((item): item is string => Boolean(item));
      if (!selectedLabels.length) return placeholder;
      return formatSummary(selectedLabels);
    }, [value, options, placeholder, formatSummary]);

    return (
      <div
        role={label ? 'group' : undefined}
        aria-labelledby={label ? labelId : undefined}
        {...props}
        ref={setRefs}
        onKeyDown={handleKeyDown}
        className={cx(styles.root, className)}
      >
        {label && (
          <span id={labelId} className={styles.label}>
            {label}
          </span>
        )}
        <button
          ref={triggerRef}
          type="button"
          className={cx(styles.trigger, isOpen && styles.triggerOpen)}
          onClick={() => setIsOpen((prev) => !prev)}
          // A disclosure: the popover holds checkboxes, not a listbox or a
          // menu, so no `aria-haspopup`; `aria-controls` points at it.
          aria-expanded={isOpen}
          aria-controls={isOpen ? popoverId : undefined}
          aria-describedby={hint ? hintId : undefined}
        >
          <span className={cx(!value.length && styles.placeholder)}>
            {summary}
          </span>
          <span aria-hidden="true" className={styles.chevron}>
            {isOpen ? '▴' : '▾'}
          </span>
        </button>
        {hint && (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        )}
        {isOpen && (
          <div id={popoverId} className={styles.popover}>
            <div className={styles.options}>
              {options.map((option) => (
                <label key={option.value} className={styles.option}>
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
                    onChange={() => toggleValue(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <div className={styles.footer}>
              <Button type="button" variant="link" size="sm" onClick={close}>
                {doneLabel}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

MultiSelect.displayName = 'MultiSelect';
