import { forwardRef } from 'react';
import { LoadMore as PrimitiveLoadMore } from '@thijulio/primitives';
import type { LoadMoreAlign, LoadMoreProps } from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';
import { cx } from '../_util/style';
import buttonStyles from '../Button/Button.module.css';

export type { LoadMoreAlign, LoadMoreProps };

/**
 * LoadMore — the shared primitive, with its button wearing the Exodus Button
 * skin so it matches every other Exodus action.
 */
export const LoadMore = forwardRef<HTMLElement, LoadMoreProps>(
  function LoadMore({ buttonSize = 'md', buttonClassName, ...props }, ref) {
    return (
      <PrimitiveLoadMore
        {...props}
        ref={ref}
        buttonSize={buttonSize}
        buttonClassName={cx(
          buttonStyles.btn,
          buttonStyles[buttonSize],
          buttonClassName,
        )}
      />
    );
  },
);

LoadMore.displayName = 'LoadMore';
