import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './Tag.module.css';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** outline (default), solid brand, or muted. */
  variant?: 'outline' | 'solid' | 'muted';
  /** Show a pulsing status dot before the label. */
  status?: boolean;
  children?: ReactNode;
}

/** Tag — pill label for categories, skills and status. */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { variant = 'outline', status = false, className, children, ...props },
  ref,
) {
  return (
    <span
      {...props}
      ref={ref}
      className={cx(styles.tag, styles[variant], className)}
    >
      {status && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
});

Tag.displayName = 'Tag';
