import { forwardRef } from 'react';
import { EmptyState as PrimitiveEmptyState } from '@thijulio/primitives';
import type {
  EmptyStateAlign,
  EmptyStateHeadingLevel,
  EmptyStateProps,
  EmptyStateSize,
  EmptyStateSurface,
} from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';
import { cx } from '../_util/style';
import styles from './EmptyState.module.css';

export type {
  EmptyStateAlign,
  EmptyStateHeadingLevel,
  EmptyStateProps,
  EmptyStateSize,
  EmptyStateSurface,
};

/**
 * EmptyState — dashed panel with an accent icon tile, title, copy and action.
 * Existing Exodus API, backed by the shared EmptyState implementation.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState({ className, ...props }, ref) {
    return (
      <PrimitiveEmptyState
        {...props}
        ref={ref}
        className={cx(styles.compat, className)}
      />
    );
  },
);

EmptyState.displayName = 'EmptyState';
