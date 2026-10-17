import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cx } from '../_util/style';
import styles from './IconButton.module.css';

export type IconButtonVariant = 'ghost' | 'secondary' | 'primary' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  /** Accessible name (`aria-label`). Required: the button has no visible text. */
  label: string;
  /** The glyph, usually an `<Icon>`; it is hidden from assistive technology. */
  icon: ReactNode;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  /**
   * Busy state. Like Button, it never sets native `disabled` (that would drop
   * keyboard focus): it sets `aria-busy`/`aria-disabled` and swallows clicks.
   */
  isLoading?: boolean;
}

const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  ghost: styles.ghost,
  secondary: styles.secondary,
  primary: styles.primary,
  danger: styles.danger,
};

/** IconButton — a square, icon-only action with a required label. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      label,
      icon,
      size = 'md',
      variant = 'ghost',
      isLoading = false,
      type = 'button',
      onClick,
      className,
      'aria-busy': ariaBusy,
      'aria-disabled': ariaDisabled,
      ...props
    },
    ref,
  ) {
    const handleClick = isLoading
      ? (event: MouseEvent<HTMLButtonElement>) => event.preventDefault()
      : onClick;
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        {...props}
        aria-busy={isLoading ? true : ariaBusy}
        aria-disabled={isLoading ? true : ariaDisabled}
        onClick={handleClick}
        className={cx(
          styles.iconButton,
          styles[size],
          VARIANT_CLASS[variant],
          isLoading && styles.loading,
          className,
        )}
      >
        {isLoading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : (
          <span className={styles.glyph} aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  },
);
IconButton.displayName = 'IconButton';
