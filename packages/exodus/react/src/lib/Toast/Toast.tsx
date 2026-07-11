import type { HTMLAttributes, ReactNode } from 'react';
import { cx, type StyleWithVars } from '../_util/style';
import styles from './Toast.module.css';

export type ToastTone = 'success' | 'warning' | 'danger' | 'info';

export interface ToastProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  /** Fixed semantic left-bar — meaning does not theme. */
  tone?: ToastTone;
  title: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
}

/** Toast — notification card with a fixed semantic left-bar and optional dismiss. */
export function Toast({
  tone = 'info',
  title,
  children,
  onClose,
  className,
  style,
  ...props
}: ToastProps) {
  const vars: StyleWithVars = { '--toast-bar': `var(--${tone})`, ...style };
  return (
    <div
      className={cx(styles.toast, className)}
      style={vars}
      role="status"
      {...props}
    >
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        {children && <div className={styles.body}>{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className={styles.close}
        >
          ×
        </button>
      )}
    </div>
  );
}
