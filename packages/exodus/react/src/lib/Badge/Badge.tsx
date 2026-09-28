import { Badge as PrimitiveBadge } from '@thijulio/primitives';
import type {
  BadgeProps as PrimitiveBadgeProps,
  BadgeTone as PrimitiveBadgeTone,
} from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';
import { cx } from '../_util/style';
import styles from './Badge.module.css';

export type BadgeTone = Exclude<PrimitiveBadgeTone, 'brand'>;
export interface BadgeProps extends Omit<PrimitiveBadgeProps, 'tone'> {
  /** Fixed count/label palette. Lifecycle states should use StatusBadge. */
  tone?: BadgeTone;
}

/** Existing Exodus palette and API, rendered by the shared Badge. */
export function Badge({ className, ...props }: BadgeProps) {
  return <PrimitiveBadge className={cx(styles.compat, className)} {...props} />;
}
