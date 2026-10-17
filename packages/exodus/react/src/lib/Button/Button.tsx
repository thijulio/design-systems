import { forwardRef } from 'react';
import { Button as PrimitiveButton } from '@thijulio/primitives';
import type {
  ButtonElement,
  ButtonProps as PrimitiveButtonProps,
} from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';
import { cx } from '../_util/style';
import styles from './Button.module.css';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'soft'
  | 'ghost'
  | 'danger'
  | 'danger-outline'
  | 'link';

export interface ButtonProps extends Omit<PrimitiveButtonProps, 'variant'> {
  /** Seven intents. Accent-driven ones reskin per theme; danger stays fixed. */
  variant?: ButtonVariant;
}

/**
 * Button — Exodus action control. Every colour resolves through tokens (no
 * literal hex), so accent variants reskin per theme. Loading, `asChild`,
 * `fullWidth` and link mode come from the shared primitive.
 */
export const Button = forwardRef<ButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return (
    <PrimitiveButton
      {...props}
      ref={ref}
      variant={variant}
      size={size}
      type={type}
      className={cx(styles.btn, styles[size], className)}
    />
  );
});

Button.displayName = 'Button';
