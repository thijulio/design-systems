import type { HTMLAttributes } from 'react';
import { cx, type StyleWithVars } from '../_util/style';
import styles from './Avatar.module.css';

const TONE_BG = {
  brand: ['var(--ds-brand)', 'var(--ds-on-brand)'],
  accent: ['var(--ds-accent)', 'var(--ds-on-accent)'],
  neutral: ['var(--ds-surface-sunken)', 'var(--ds-text)'],
  success: ['var(--ds-success)', 'var(--ds-on-accent)'],
  warning: ['var(--ds-warning)', 'var(--ds-on-highlight)'],
  danger: ['var(--ds-danger)', 'var(--ds-on-accent)'],
  info: ['var(--ds-info)', 'var(--ds-on-accent)'],
} as const;

export type AvatarTone = keyof typeof TONE_BG;

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  initials: string;
  /** Pixel size (width/height); the font scales with it. */
  size?: number;
  /** brand fill (default), accent fill, or neutral. */
  variant?: 'brand' | 'accent' | 'neutral';
  shape?: 'circle' | 'rounded';
  /** Fixed palette, overriding variant. */
  tone?: AvatarTone;
}

/** Avatar — circular (or rounded) initials chip. */
export function Avatar({
  initials,
  size = 32,
  variant = 'brand',
  shape = 'circle',
  tone,
  className,
  style,
  ...props
}: AvatarProps) {
  const key: AvatarTone = tone ?? variant;
  const [bg, fg] = TONE_BG[key];
  const vars: StyleWithVars = {
    '--av-size': `${size}px`,
    '--av-font': `${size * 0.38}px`,
    '--av-bg': bg,
    '--av-fg': fg,
    ...style,
  };
  return (
    <span
      className={cx(
        styles.avatar,
        shape === 'circle' ? styles.circle : styles.rounded,
        className,
      )}
      style={vars}
      {...props}
    >
      {initials}
    </span>
  );
}
