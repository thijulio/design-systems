import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Tag.module.css';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** outline (default), solid emphasis, or muted mono. */
  variant?: 'outline' | 'solid' | 'muted';
  /** Show a pulsing status dot before the label. */
  status?: boolean;
  children?: ReactNode;
}

/**
 * Tag — pill label for skills, categories and status.
 */
export function Tag({
  variant = 'outline',
  status = false,
  children,
  className,
  ...rest
}: TagProps) {
  const cls = [styles.tag, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={cls} {...rest}>
      {status && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
