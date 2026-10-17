import { forwardRef } from 'react';
import { Toast as PrimitiveToast } from '@thijulio/primitives';
import type { ToastProps, ToastTone } from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';
import { cx } from '../_util/style';
import styles from './Toast.module.css';

export type { ToastProps, ToastTone };

/**
 * Toast — notification card with a fixed semantic left-bar and optional
 * dismiss. `role` follows the tone (`alert` for danger/warning, `status`
 * otherwise); inside a viewport that is itself the live region, pass
 * `announce={false}`, or pass `role` to override.
 *
 * Existing Exodus API (the same as the shared Toast's), rendered by the
 * shared Toast under the Exodus skin.
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  function Toast(props, ref) {
    return (
      <PrimitiveToast
        {...props}
        ref={ref}
        className={cx(styles.compat, props.className)}
      />
    );
  },
);

Toast.displayName = 'Toast';
