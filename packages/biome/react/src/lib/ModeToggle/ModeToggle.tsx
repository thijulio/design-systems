import type { HTMLAttributes, KeyboardEvent } from 'react';
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

  function moveToMode(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    const nextIndex =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? (currentIndex + 1) % MODES.length
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? (currentIndex - 1 + MODES.length) % MODES.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? MODES.length - 1
              : undefined;

    if (nextIndex === undefined) return;

    event.preventDefault();
    onChange?.(MODES[nextIndex].id);
    event.currentTarget
      .closest('[role="tablist"]')
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus();
  }

  return (
    <div className={cls} role="tablist" aria-label="Site posture" {...rest}>
      {MODES.map((mode, index) => (
        <button
          key={mode.id}
          type="button"
          role="tab"
          aria-selected={value === mode.id}
          tabIndex={value === mode.id ? 0 : -1}
          className={styles.tab}
          onClick={() => onChange?.(mode.id)}
          onKeyDown={(event) => moveToMode(event, index)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
