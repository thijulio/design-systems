import type { HTMLAttributes, ReactNode } from 'react';
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

const STATE_LABEL: Record<LifecycleState, string> = {
  draft: 'Draft',
  archived: 'Archived',
  pending: 'Pending',
  'awaiting-review': 'Awaiting review',
  'on-hold': 'On hold',
  confirmed: 'Confirmed',
  reserved: 'Reserved',
  active: 'Active',
  completed: 'Completed',
  available: 'Available',
  adopted: 'Adopted',
  quarantined: 'Quarantined',
  cancelled: 'Cancelled',
};

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Lifecycle state — resolves to a fixed tone + default label. */
  state?: LifecycleState;
  /** Override the tone directly. */
  tone?: StatusTone;
  /** Override the label text. */
  label?: ReactNode;
}

/**
 * StatusBadge — lifecycle status pill. 13 states map onto 7 fixed tones; a
 * state's colour never changes with the accent theme.
 */
export function StatusBadge({
  state,
  tone: toneProp,
  label,
  className,
  style,
  ...props
}: StatusBadgeProps) {
  const tone: StatusTone = toneProp ?? (state ? STATE_TONE[state] : 'neutral');
  const vars: StyleWithVars = {
    '--sb-soft': `var(--tone-${tone}-soft)`,
    '--sb-fg': `var(--tone-${tone}-fg)`,
    '--sb-dot': `var(--tone-${tone}-dot)`,
    ...style,
  };
  return (
    <span className={cx(styles.badge, className)} style={vars} {...props}>
      <span className={styles.dot} aria-hidden="true" />
      {label ?? (state ? STATE_LABEL[state] : null)}
    </span>
  );
}
