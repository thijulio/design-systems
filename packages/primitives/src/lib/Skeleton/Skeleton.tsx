import { forwardRef, type HTMLAttributes } from 'react';
import { cx, type StyleWithVars } from '../_util/style';
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden';
import styles from './Skeleton.module.css';

export type SkeletonRadius = 'sm' | 'md' | 'lg' | 'full';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /** CSS length, or px when a number. Defaults to the full width. */
  width?: string | number;
  /** CSS length, or px when a number. Defaults to one line of text. */
  height?: string | number;
  radius?: SkeletonRadius;
  /**
   * Announced loading text. Without it the placeholder is decorative
   * (`aria-hidden`); with it, a `status` region with visually hidden text.
   */
  label?: string;
}

const RADIUS_CLASS: Record<SkeletonRadius, string> = {
  sm: styles.radiusSm,
  md: styles.radiusMd,
  lg: styles.radiusLg,
  full: styles.radiusFull,
};

const toLength = (value: string | number) =>
  typeof value === 'number' ? `${value}px` : value;

/** Skeleton — a shimmering placeholder block shown while content loads. */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(
  function Skeleton(
    { width, height, radius = 'md', label, className, style, ...props },
    ref,
  ) {
    const vars: StyleWithVars = { ...style };
    if (width !== undefined) vars['--ds-skeleton-width'] = toLength(width);
    if (height !== undefined) vars['--ds-skeleton-height'] = toLength(height);
    return (
      <span
        ref={ref}
        {...(label ? { role: 'status' } : { 'aria-hidden': true })}
        {...props}
        style={vars}
        className={cx(styles.skeleton, RADIUS_CLASS[radius], className)}
      >
        {label && <VisuallyHidden>{label}</VisuallyHidden>}
      </span>
    );
  },
);
Skeleton.displayName = 'Skeleton';
