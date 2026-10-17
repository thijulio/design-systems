import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../_util/style';
import { composeRefs } from '../_util/refs';
import { fieldDescribedBy, fieldErrorId, fieldHintId } from '../_util/fieldIds';
import styles from './FileInput.module.css';

export interface FileInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue'
> {
  /** Field label (`<label htmlFor>`); the input's accessible name. */
  label: ReactNode;
  /**
   * Text of the visible choose button. Required: no default copy. The
   * browser's own button text follows the browser's language, not the page's.
   */
  chooseLabel: ReactNode;
  /** Status text while nothing is chosen. Required: no default copy. */
  noFileLabel: ReactNode;
  /**
   * Status text once a file is chosen, in place of the file names (e.g.
   * "Selected: {name}"). Unset, the chosen file names show.
   */
  fileLabel?: ReactNode;
  /** Help text, id `fieldHintId(id)`; describes the input. */
  hint?: ReactNode;
  /** Error text, id `fieldErrorId(id)`, `role="alert"`; sets `aria-invalid` and replaces the hint. */
  error?: ReactNode;
  /** Class for the root; `className` lands on the native input. */
  wrapperClassName?: string;
}

/**
 * FileInput — a label, the native `<input type="file">` (transparent, laid
 * exactly over the choose button so it keeps focus, the accessible name and
 * real clicks), the decorative choose button it is drawn as, and a status
 * line with the chosen file names or `noFileLabel`.
 * The input is described by the status line plus the error or hint. The id is
 * `id`, else generated (never `name`, which may repeat). Rest props, the ref and `onChange` land
 * on the input.
 */
export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  function FileInput(
    {
      label,
      chooseLabel,
      noFileLabel,
      fileLabel,
      hint,
      error,
      wrapperClassName,
      className,
      id,
      onChange,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const statusId = `${inputId}-status`;
    const [fileNames, setFileNames] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const setRefs = useMemo(() => composeRefs(inputRef, ref), [ref]);

    // `form.reset()` clears the input without a change event, so the status
    // line would keep the old file names.
    useEffect(() => {
      const form = inputRef.current?.form;
      if (!form) return;
      const clear = () => setFileNames([]);
      form.addEventListener('reset', clear);
      return () => form.removeEventListener('reset', clear);
    }, []);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setFileNames(Array.from(event.target.files ?? [], (file) => file.name));
      onChange?.(event);
    };

    const describedBy = [statusId, fieldDescribedBy(inputId, { error, hint })]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={cx(styles.field, wrapperClassName)}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        <div className={styles.control}>
          <input
            ref={setRefs}
            id={inputId}
            type="file"
            className={cx(styles.native, className)}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={handleChange}
            {...props}
          />
          {/* What the input on top of it is drawn as; the input itself takes the click,
              so this is not a label (one input, one label) and stays hidden.
              aria-disabled marks it inactive for contrast audits (WCAG 1.4.3
              exempts inactive controls), which cannot see the input's state. */}
          <span
            className={styles.trigger}
            aria-hidden="true"
            aria-disabled={props.disabled ? true : undefined}
          >
            {chooseLabel}
          </span>
          <span id={statusId} className={styles.fileName}>
            {fileNames.length
              ? (fileLabel ?? fileNames.join(', '))
              : noFileLabel}
          </span>
        </div>
        {error ? (
          <span
            id={fieldErrorId(inputId)}
            role="alert"
            className={styles.error}
          >
            {error}
          </span>
        ) : (
          hint && (
            <span id={fieldHintId(inputId)} className={styles.hint}>
              {hint}
            </span>
          )
        )}
      </div>
    );
  },
);

FileInput.displayName = 'FileInput';
