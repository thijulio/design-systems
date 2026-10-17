import { forwardRef, type ElementType, type HTMLAttributes } from 'react';
import { cx } from '../_util/style';
import { responsiveClasses, type Responsive } from '../_util/responsive';
import styles from './GridItem.module.css';

export type GridSpan = 1 | 2 | 3 | 4 | 5 | 6 | 'full';

export interface GridItemProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  /** Columns to span, optionally per breakpoint (`{ md: 2 }`). */
  span?: Responsive<GridSpan>;
}

const spanKey = (span: GridSpan) => (span === 'full' ? 'Full' : String(span));

/** GridItem — a Grid child that spans several columns. */
export const GridItem = forwardRef<HTMLElement, GridItemProps>(
  function GridItem({ as: Component = 'div', span, className, ...props }, ref) {
    return (
      <Component
        ref={ref}
        {...props}
        className={cx(
          ...responsiveClasses(span, (prefix, value) =>
            prefix
              ? styles[`${prefix}Span${spanKey(value)}`]
              : styles[`span${spanKey(value)}`],
          ),
          className,
        )}
      />
    );
  },
);
GridItem.displayName = 'GridItem';
