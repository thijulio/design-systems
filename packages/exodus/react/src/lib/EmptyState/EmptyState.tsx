import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './EmptyState.module.css';

export interface EmptyStateProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  /** Icon rendered in the accent tile. */
  icon?: ReactNode;
  title: ReactNode;
  /** Supporting copy. */
  children?: ReactNode;
  /** Optional action slot (e.g. a Button). */
  action?: ReactNode;
}

/** EmptyState — dashed panel with an accent icon tile, title, copy and action. */
export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cx(styles.root, className)} {...props}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <h3 className={styles.title}>{title}</h3>
      {children && <p className={styles.body}>{children}</p>}
      {action}
    </div>
  );
}
