import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './Button.module.css';

export type ButtonVariant =
  'primary' | 'secondary' | 'soft' | 'ghost' | 'danger' | 'danger-outline';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Six intents. Accent-driven ones reskin per theme; danger stays fixed. */
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  soft: styles.soft,
  ghost: styles.ghost,
  danger: styles.danger,
  'danger-outline': styles.dangerOutline,
};

/**
 * Button — Exodus action control. Six intents, three sizes; every colour
 * resolves through tokens (no literal hex), so accent variants reskin per theme.
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
