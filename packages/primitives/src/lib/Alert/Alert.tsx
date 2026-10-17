import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../_util/style';
import styles from './Alert.module.css';

export type AlertTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type AlertLive = 'polite' | 'assertive' | 'off';

export interface AlertProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  tone: AlertTone;
  /** Bold first line. */
  title?: ReactNode;
  children?: ReactNode;
  /** Trailing control (e.g. a retry Button). */
  action?: ReactNode;
  /**
   * Live-region semantics: `polite` → `role="status"`, `assertive` →
   * `role="alert"`, `off` → no role. An explicit `role` prop always wins.
   */
  live?: AlertLive;
  /** Leading decorative icon. */
  icon?: ReactNode;
  /** Element to render; defaults to `div`. */
  as?: ElementType;
}

const TONE_CLASS: Record<AlertTone, string> = {
  neutral: styles.neutral,
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
};

const LIVE_ROLE: Record<AlertLive, 'status' | 'alert' | undefined> = {
  polite: 'status',
  assertive: 'alert',
  off: undefined,
};

/**
 * Alert — a tinted callout. Inner parts are spans so `as="p"` stays valid
 * HTML; with no title, icon or action the children render directly, keeping
 * the text node structure of the panel it replaces.
 */
export const Alert = forwardRef<HTMLElement, AlertProps>(function Alert(
  {
    tone,
    title,
    children,
    action,
    live = 'off',
    icon,
    as: Component = 'div',
    role,
    className,
    ...props
  },
  ref,
) {
  const structured = Boolean(title || icon || action);
  return (
    <Component
      ref={ref}
      role={role ?? LIVE_ROLE[live]}
      {...props}
      className={cx(
        styles.alert,
        TONE_CLASS[tone],
        structured && styles.structured,
        className,
      )}
    >
      {structured ? (
        <>
          {icon && (
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
          )}
          <span className={styles.content}>
            {title && <span className={styles.title}>{title}</span>}
            {children !== undefined && children !== null && (
              <span className={styles.body}>{children}</span>
            )}
          </span>
          {action && <span className={styles.action}>{action}</span>}
        </>
      ) : (
        children
      )}
    </Component>
  );
});
Alert.displayName = 'Alert';
