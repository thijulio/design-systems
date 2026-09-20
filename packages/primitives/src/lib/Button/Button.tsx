import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './Button.module.css';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'soft'
  | 'ghost'
  | 'danger'
  | 'danger-outline';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Intent. primary = brand fill, accent = accent fill; the rest as named. */
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: styles.primary,
  accent: styles.accent,
  secondary: styles.secondary,
  soft: styles.soft,
  ghost: styles.ghost,
  danger: styles.danger,
  'danger-outline': styles.dangerOutline,
};

/**
 * Button — brand-agnostic action control. Every colour resolves through the
 * shared `--ds-*` contract, so each brand skins it by supplying those aliases.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        styles.btn,
        styles[size],
        VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
