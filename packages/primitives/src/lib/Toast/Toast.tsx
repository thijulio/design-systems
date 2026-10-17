import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './Toast.module.css';

export type ToastTone = 'success' | 'warning' | 'danger' | 'info';

/** danger/warning interrupt (`alert`); success/info wait their turn (`status`). */
const TONE_ROLE: Record<ToastTone, 'alert' | 'status'> = {
  success: 'status',
  info: 'status',
  warning: 'alert',
  danger: 'alert',
};

const TONE_CLASS: Record<ToastTone, string> = {
  success: styles.success,
  info: styles.info,
  warning: styles.warning,
  danger: styles.danger,
};

interface ToastBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Colour of the leading bar. Also picks the live role. Default `info`. */
  tone?: ToastTone;
  /** Bold headline. Omit it and the children take its place. */
  title?: ReactNode;
  children?: ReactNode;
  /**
   * `false` renders no live role, for a toast inside a region that is
   * already live (e.g. `ToastViewport`), which would otherwise read it twice.
   * Default `true`. An explicit `role` always wins.
   */
  announce?: boolean;
}

/** Dismissible toasts must name their close button: there is no default copy. */
export type ToastProps = ToastBaseProps &
  (
    | {
        /** Renders a dismiss button that calls this. */
        onClose: () => void;
        /** Accessible name of the dismiss button. */
        dismissLabel: string;
      }
    | { onClose?: undefined; dismissLabel?: undefined }
  );

const isPresent = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false;

/**
 * Toast — a notification card with a tone bar on its inline-start edge and
 * an optional dismiss button. `role` follows the tone (`alert` for
 * danger/warning, `status` otherwise); inside a viewport that is itself the
 * live region, pass `announce={false}`, or pass `role` to override.
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    tone = 'info',
    title,
    children,
    announce = true,
    onClose,
    dismissLabel,
    className,
    role,
    ...props
  },
  ref,
) {
  const hasTitle = isPresent(title);
  return (
    <div
      {...props}
      ref={ref}
      role={role ?? (announce ? TONE_ROLE[tone] : undefined)}
      className={cx(styles.toast, TONE_CLASS[tone], className)}
    >
      <div className={styles.content}>
        {hasTitle && <div className={styles.title}>{title}</div>}
        {isPresent(children) && (
          <div className={hasTitle ? styles.body : styles.lead}>
            {children}
          </div>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={dismissLabel}
          className={styles.close}
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
});

Toast.displayName = 'Toast';
