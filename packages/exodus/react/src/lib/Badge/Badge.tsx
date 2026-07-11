import type { HTMLAttributes, ReactNode } from 'react';
import { cx, type StyleWithVars } from '../_util/style';
import styles from './Badge.module.css';

const TONES = {
  neutral: ['var(--n-200)', 'var(--n-600)'],
  accent: ['var(--accent-soft)', 'var(--accent-fg)'],
  success: ['var(--success-soft)', 'var(--success-fg)'],
  warning: ['var(--warning-soft)', 'var(--warning-fg)'],
  danger: ['var(--danger-soft)', 'var(--danger-fg)'],
  info: ['var(--info-soft)', 'var(--info-fg)'],
} as const;

export type BadgeTone = keyof typeof TONES;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Fixed count/label palette. Lifecycle states should use StatusBadge. */
  tone?: BadgeTone;
  children?: ReactNode;
}

/** Badge — small count / label chip with a fixed tone. */
export function Badge({
  tone = 'neutral',
  className,
  style,
  children,
  ...props
}: BadgeProps) {
  const [bg, fg] = TONES[tone] ?? TONES.neutral;
  const vars: StyleWithVars = { '--badge-bg': bg, '--badge-fg': fg, ...style };
  return (
    <span className={cx(styles.badge, className)} style={vars} {...props}>
      {children}
    </span>
  );
}
