import { forwardRef } from 'react';
import { ErrorState as PrimitiveErrorState } from '@thijulio/primitives';
import type {
  ErrorStateAlign,
  ErrorStateAnnounce,
  ErrorStateProps,
} from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';
import { cx } from '../_util/style';
import buttonStyles from '../Button/Button.module.css';

export type { ErrorStateAlign, ErrorStateAnnounce, ErrorStateProps };

/**
 * ErrorState — the shared primitive, with its retry button wearing the Exodus
 * Button skin so it matches every other Exodus action.
 */
export const ErrorState = forwardRef<HTMLElement, ErrorStateProps>(
  function ErrorState({ retrySize = 'md', retryClassName, ...props }, ref) {
    return (
      <PrimitiveErrorState
        {...props}
        ref={ref}
        retrySize={retrySize}
        retryClassName={cx(
          buttonStyles.btn,
          buttonStyles[retrySize],
          retryClassName,
        )}
      />
    );
  },
);

ErrorState.displayName = 'ErrorState';
