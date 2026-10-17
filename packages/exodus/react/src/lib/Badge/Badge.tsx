import { forwardRef } from 'react';
import { Badge as PrimitiveBadge } from '@thijulio/primitives';
import type {
  BadgeProps as PrimitiveBadgeProps,
  BadgeTone as PrimitiveBadgeTone,
} from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';
import { cx, type StyleWithVars } from '../_util/style';
import styles from './Badge.module.css';

/** The Exodus `--tone-*` palette (same hues StatusBadge uses). */
const PALETTE_TONES = [
  'amber',
  'blue',
  'green',
  'teal',
  'violet',
  'red',
] as const;
type PaletteTone = (typeof PALETTE_TONES)[number];

export type BadgeTone = Exclude<PrimitiveBadgeTone, 'brand'> | PaletteTone;
export interface BadgeProps extends Omit<PrimitiveBadgeProps, 'tone'> {
  /**
   * Fixed count/label palette: the semantic tones, or an Exodus `--tone-*`
   * hue. Lifecycle states should use StatusBadge.
   */
  tone?: BadgeTone;
}

function isPaletteTone(tone: BadgeTone): tone is PaletteTone {
  return (PALETTE_TONES as readonly string[]).includes(tone);
}

/** Existing Exodus palette and API, rendered by the shared Badge. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = 'neutral', className, style, ...props },
  ref,
) {
  if (isPaletteTone(tone)) {
    const vars: StyleWithVars = {
      '--badge-bg': `var(--tone-${tone}-soft)`,
      '--badge-fg': `var(--tone-${tone}-fg)`,
      ...style,
    };
    return (
      <PrimitiveBadge
        data-tone={tone}
        {...props}
        ref={ref}
        style={vars}
        className={cx(styles.compat, className)}
      />
    );
  }
  return (
    <PrimitiveBadge
      {...props}
      ref={ref}
      tone={tone}
      style={style}
      className={cx(styles.compat, className)}
    />
  );
});

Badge.displayName = 'Badge';
