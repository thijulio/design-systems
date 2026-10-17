import { forwardRef, type AllHTMLAttributes, type ElementType } from 'react';
import { cx } from '../_util/style';
import styles from './VisuallyHidden.module.css';

/** All HTML attributes, so `as="a"` can take `href` (skip links). */
export interface VisuallyHiddenProps extends Omit<
  AllHTMLAttributes<HTMLElement>,
  'as'
> {
  /** Element to render; defaults to `span`. */
  as?: ElementType;
  /** Reveal while it (or a descendant) has focus — for skip links. */
  focusable?: boolean;
}

/** VisuallyHidden — content for assistive technology only (`sr-only`). */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(
  function VisuallyHidden(
    { as: Component = 'span', focusable = false, className, ...props },
    ref,
  ) {
    return (
      <Component
        ref={ref}
        {...props}
        className={cx(focusable ? styles.focusable : styles.hidden, className)}
      />
    );
  },
);
VisuallyHidden.displayName = 'VisuallyHidden';
