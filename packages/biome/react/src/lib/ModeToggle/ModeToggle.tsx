import type { HTMLAttributes } from 'react';
import styles from './ModeToggle.module.css';

export type Mode = 'explorer' | 'recruiter';

export interface ModeToggleProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  /** Currently selected posture. */
  value?: Mode;
  /** Called with the newly selected mode. */
  onChange?: (value: Mode) => void;
}

const MODES: ReadonlyArray<{ id: Mode; label: string }> = [
  { id: 'explorer', label: 'Explorer' },
  { id: 'recruiter', label: 'Recruiter' },
];

/**
 * ModeToggle — switches the site between Explorer (expressive) and Recruiter
 * (focused) postures. Controlled via `value` + `onChange`.
 */
export function ModeToggle({
  value = 'explorer',
  onChange,
  className,
  ...rest
}: ModeToggleProps) {
  const cls = [styles.toggle, className].filter(Boolean).join(' ');

  return (
    <div className={cls} role="tablist" {...rest}>
      {MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          role="tab"
          aria-selected={value === mode.id}
          className={styles.tab}
          onClick={() => onChange?.(mode.id)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
