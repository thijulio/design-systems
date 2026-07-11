import type { HTMLAttributes } from 'react';
import { cx, type StyleWithVars } from '../_util/style';
import styles from './Avatar.module.css';

const TONE_BG = {
  accent: ['var(--accent)', 'var(--accent-on)'],
  soft: ['var(--accent-soft)', 'var(--accent-fg)'],
  neutral: ['var(--n-200)', 'var(--n-700)'],
  green: ['var(--tone-green-soft)', 'var(--tone-green-fg)'],
  blue: ['var(--tone-blue-soft)', 'var(--tone-blue-fg)'],
  teal: ['var(--tone-teal-soft)', 'var(--tone-teal-fg)'],
  amber: ['var(--tone-amber-soft)', 'var(--tone-amber-fg)'],
  violet: ['var(--tone-violet-soft)', 'var(--tone-violet-fg)'],
} as const;

export type AvatarTone = keyof typeof TONE_BG;

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  initials: string;
  /** Pixel size (width/height); font scales with it. */
  size?: number;
  /** accent fill (default) or soft tint. */
  variant?: 'accent' | 'soft';
  shape?: 'circle' | 'rounded';
  /** Fixed status palette, overriding variant (for profile-type avatars). */
  tone?: AvatarTone;
}

/** Avatar — circular (or rounded) initials chip. */
export function Avatar({
  initials,
  size = 32,
  variant = 'accent',
  shape = 'circle',
  tone,
  className,
  style,
  ...props
}: AvatarProps) {
  const key: AvatarTone = tone ?? (variant === 'soft' ? 'soft' : 'accent');
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
