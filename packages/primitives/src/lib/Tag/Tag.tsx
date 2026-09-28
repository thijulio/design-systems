import type { HTMLAttributes, ReactNode } from 'react';
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
export function Tag({
  variant = 'outline',
  status = false,
  className,
  children,
  ...props
}: TagProps) {
  return (
    <span className={cx(styles.tag, styles[variant], className)} {...props}>
      {status && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
