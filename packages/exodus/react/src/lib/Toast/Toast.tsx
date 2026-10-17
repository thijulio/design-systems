import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx, type StyleWithVars } from '../_util/style';
import styles from './Toast.module.css';

export type ToastTone = 'success' | 'warning' | 'danger' | 'info';

/** danger/warning interrupt (`alert`); success/info wait their turn (`status`). */
const TONE_ROLE: Record<ToastTone, 'alert' | 'status'> = {
  success: 'status',
  info: 'status',
  warning: 'alert',
  danger: 'alert',
};

interface ToastBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Fixed semantic left-bar — meaning does not theme. Also picks the live role. */
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

/** Dismissible toasts must name their close button: there is no English default. */
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

/**
 * Toast — notification card with a fixed semantic left-bar and optional
 * dismiss. `role` follows the tone (`alert` for danger/warning, `status`
 * otherwise); inside a viewport that is itself the live region, pass
 * `announce={false}`, or pass `role` to override.
 *
 * Same API as the shared `Toast` in `@thijulio/primitives`, which it
 * replaces under the same name: Exodus keeps its own skin (palette bar
 * through `--toast-bar`, spacing, caption body) rather than wrapping it.
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
    style,
    role,
    ...props
  },
  ref,
) {
  const vars: StyleWithVars = { '--toast-bar': `var(--${tone})`, ...style };
  const hasTitle = title !== undefined && title !== null && title !== false;
  const hasChildren =
    children !== undefined && children !== null && children !== false;
  return (
    <div
      {...props}
      ref={ref}
      role={role ?? (announce ? TONE_ROLE[tone] : undefined)}
      style={vars}
      className={cx(styles.toast, className)}
    >
      <div className={styles.content}>
        {hasTitle && <div className={styles.title}>{title}</div>}
        {hasChildren && (
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
