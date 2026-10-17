import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx, type StyleWithVars } from '../_util/style';
import styles from './StatusBadge.module.css';

/** state → tone. Single source of truth for lifecycle colour meaning (theme-independent). */
export const STATE_TONE = {
  draft: 'neutral',
  archived: 'neutral',
  pending: 'amber',
  'awaiting-review': 'amber',
  'on-hold': 'amber',
  confirmed: 'blue',
  reserved: 'violet',
  active: 'green',
  completed: 'green',
  available: 'teal',
  adopted: 'teal',
  quarantined: 'red',
  cancelled: 'red',
} as const;

export type LifecycleState = keyof typeof STATE_TONE;
export type StatusTone =
  'neutral' | 'amber' | 'blue' | 'violet' | 'green' | 'teal' | 'red';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visible label (required: there are no English defaults; pass translated text). */
  label: ReactNode;
  /** Lifecycle state — resolves to a fixed tone. */
  state?: LifecycleState;
  /** Override the tone directly. */
  tone?: StatusTone;
}

/**
 * StatusBadge — lifecycle status pill. 13 states map onto 7 fixed tones; a
 * state's colour never changes with the accent theme.
 */
export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  function StatusBadge(
    { state, tone: toneProp, label, className, style, ...props },
    ref,
  ) {
    const tone: StatusTone =
      toneProp ?? (state ? STATE_TONE[state] : 'neutral');
    const vars: StyleWithVars = {
      '--sb-soft': `var(--tone-${tone}-soft)`,
      '--sb-fg': `var(--tone-${tone}-fg)`,
      '--sb-dot': `var(--tone-${tone}-dot)`,
      ...style,
    };
    return (
      <span
        data-tone={tone}
        {...props}
        ref={ref}
        style={vars}
        className={cx(styles.badge, className)}
      >
        <span className={styles.dot} aria-hidden="true" />
        {label}
      </span>
    );
  },
);

StatusBadge.displayName = 'StatusBadge';
