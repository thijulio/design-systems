import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Button as PrimitiveButton } from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. primary = filled mata; secondary = outline; ghost = text-only warm. */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Control size. */
  size?: 'sm' | 'md' | 'lg';
  /** Render as an anchor instead of a button. Ignored when disabled. */
  href?: string;
  children?: ReactNode;
}

/**
 * Button — Biome Modernism's primary action control.
 * Tight geometry (radius-ui), Space Grotesk, calm hover/press feedback.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  href,
  disabled = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const cls = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <PrimitiveButton
      variant={variant}
      size={size}
      href={href}
      className={cls}
      disabled={disabled}
      {...rest}
    >
      {children}
    </PrimitiveButton>
  );
}
