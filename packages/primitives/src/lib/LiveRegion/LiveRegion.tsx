import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden';

export type LiveRegionPoliteness = 'polite' | 'assertive';

export interface LiveRegionProps extends HTMLAttributes<HTMLElement> {
  /**
   * The announcement. Every string comes from the caller; there is no
   * default copy. Pass an empty value while idle rather than unmounting.
   */
  children?: ReactNode;
  /**
   * `polite` (default) sets `role="status"`, `assertive` sets
   * `role="alert"`; `aria-live` always matches. An explicit `role` wins.
   */
  politeness?: LiveRegionPoliteness;
  /** Clip the region so only assistive technology reads it. Default true. */
  visuallyHidden?: boolean;
  /** Sets `aria-atomic`: read the whole region on every change. */
  atomic?: boolean;
  /** Element to render; defaults to `div`. */
  as?: ElementType;
}

const LIVE_ROLE: Record<LiveRegionPoliteness, 'status' | 'alert'> = {
  polite: 'status',
  assertive: 'alert',
};

/**
 * LiveRegion — an announcer for assistive technology. Screen readers only
 * observe a region that already exists, so keep it mounted and change its
 * text; a region mounted together with its text may not be read.
 */
export const LiveRegion = forwardRef<HTMLElement, LiveRegionProps>(
  function LiveRegion(
    {
      politeness = 'polite',
      visuallyHidden = true,
      atomic,
      as: Component = 'div',
      role,
      ...props
    },
    ref,
  ) {
    const live = {
      role: role ?? LIVE_ROLE[politeness],
      'aria-live': politeness,
      'aria-atomic': atomic,
    } as const;
    return visuallyHidden ? (
      <VisuallyHidden ref={ref} as={Component} {...live} {...props} />
    ) : (
      <Component ref={ref} {...live} {...props} />
    );
  },
);
LiveRegion.displayName = 'LiveRegion';
