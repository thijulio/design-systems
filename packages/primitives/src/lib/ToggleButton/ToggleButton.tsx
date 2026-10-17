import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type MouseEvent,
} from 'react';
import { cx } from '../_util/style';
import { Button } from '../Button/Button';
import styles from './ToggleButton.module.css';

type ButtonBaseProps = ComponentPropsWithoutRef<typeof Button>;

/** `default` keeps the Button's control radius; `pill` rounds it fully. */
export type ToggleButtonShape = 'default' | 'pill';

export type ToggleButtonProps = Omit<
  ButtonBaseProps,
  'href' | 'target' | 'rel' | 'download' | 'asChild' | 'aria-pressed'
> & {
  /** Current on/off state (`aria-pressed`). */
  pressed: boolean;
  /** Called with the next state on press (unless `onClick` prevented default). */
  onPressedChange?: (pressed: boolean) => void;
  /** `pill` draws a fully rounded chip, e.g. for a row of filter toggles. */
  shape?: ToggleButtonShape;
};

/**
 * ToggleButton — a Button with on/off state. Without an explicit `variant`
 * it reads as `secondary` when off and `soft` when on.
 */
export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  function ToggleButton(
    {
      pressed,
      onPressedChange,
      onClick,
      variant,
      shape = 'default',
      className,
      ...props
    },
    ref,
  ) {
    const handleClick = (
      event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
    ) => {
      onClick?.(event);
      if (!event.defaultPrevented) onPressedChange?.(!pressed);
    };
    return (
      <Button
        ref={ref}
        {...props}
        variant={variant ?? (pressed ? 'soft' : 'secondary')}
        aria-pressed={pressed}
        onClick={handleClick}
        className={cx(
          styles.toggle,
          shape === 'pill' && styles.pill,
          className,
        )}
      />
    );
  },
);
ToggleButton.displayName = 'ToggleButton';
