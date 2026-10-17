import {
  forwardRef,
  isValidElement,
  type ElementType,
  type HTMLAttributes,
  type ReactElement,
} from 'react';
import { cx } from '../_util/style';
import { cloneAsChild, useSlotRef } from '../_util/slot';
import type { Space } from '../_util/space';
import { responsiveClasses, type Responsive } from '../_util/responsive';
import styles from './Container.module.css';

export type ContainerSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  /**
   * Put the container's classes, padding, props and ref on its single child
   * element instead of rendering a wrapper (e.g. a `Stack` that is also the
   * page column). `as` is ignored; the child keeps its own element.
   */
  asChild?: boolean;
  /** Max width (Tailwind `max-w-*` scale); `full` has no cap. */
  size?: ContainerSize;
  /** Responsive side gutters: 16px, 24px from sm, 32px from lg. */
  padded?: boolean;
  /**
   * Top and bottom padding, a space step, optionally per breakpoint
   * (`{ base: 8, lg: 12 }`). Unset, the container adds none.
   */
  paddingBlock?: Responsive<Space>;
}

const SIZE_CLASS: Record<ContainerSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
  '2xl': styles.s2xl,
  '3xl': styles.s3xl,
  '4xl': styles.s4xl,
  '5xl': styles.s5xl,
  '6xl': styles.s6xl,
  '7xl': styles.s7xl,
  full: styles.full,
};

/** Container — centred, max-width page column with gutters. */
export const Container = forwardRef<HTMLElement, ContainerProps>(
  function Container(
    {
      as: Component = 'div',
      asChild = false,
      size = '7xl',
      padded = true,
      paddingBlock,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const slotRef = useSlotRef(ref, asChild ? children : undefined);
    const classes = cx(
      styles.container,
      SIZE_CLASS[size],
      padded && styles.padded,
      ...responsiveClasses(paddingBlock, (prefix, n) =>
        prefix ? styles[`${prefix}Pb${n}`] : styles[`pb${n}`],
      ),
      className,
    );

    if (asChild && isValidElement(children)) {
      return cloneAsChild(
        children as ReactElement<Record<string, unknown>>,
        { ...props, className: classes },
        slotRef,
      );
    }

    return (
      <Component ref={ref} {...props} className={classes}>
        {children}
      </Component>
    );
  },
);
Container.displayName = 'Container';
