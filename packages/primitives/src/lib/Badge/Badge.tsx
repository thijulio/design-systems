import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx, type StyleWithVars } from '../_util/style';
import styles from './Badge.module.css';

const TONES = {
  neutral: ['var(--ds-surface-sunken)', 'var(--ds-text-muted)'],
  brand: ['var(--ds-brand)', 'var(--ds-on-brand)'],
  accent: ['var(--ds-accent-soft)', 'var(--ds-accent-fg)'],
  success: ['var(--ds-success-soft)', 'var(--ds-success-fg)'],
  warning: ['var(--ds-warning-soft)', 'var(--ds-warning-fg)'],
  danger: ['var(--ds-danger-soft)', 'var(--ds-danger-fg)'],
  info: ['var(--ds-info-soft)', 'var(--ds-info-fg)'],
} as const;

export type BadgeTone = keyof typeof TONES;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Fixed label/count palette. */
  tone?: BadgeTone;
  children?: ReactNode;
}

/** Badge — small count / label chip with a fixed tone. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = 'neutral', className, style, children, ...props },
  ref,
) {
  const [bg, fg] = TONES[tone] ?? TONES.neutral;
  const vars: StyleWithVars = { '--badge-bg': bg, '--badge-fg': fg, ...style };
  return (
    <span
      // The tone as data, so consumers and tests can read it without classes.
      data-tone={tone}
      {...props}
      ref={ref}
      style={vars}
      className={cx(styles.badge, className)}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';
