import { forwardRef, type ElementType, type HTMLAttributes } from 'react';
import { cx, type StyleWithVars } from '../_util/style';
import { gapClass, type Space } from '../_util/space';
import { responsiveClasses, type Responsive } from '../_util/responsive';
import styles from './Grid.module.css';

export type GridColumnCount = 1 | 2 | 3 | 4 | 5 | 6;
export type GridAlign = 'start' | 'center' | 'end' | 'stretch';

export interface GridProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  gap?: Space;
  /** Equal-width columns, optionally per breakpoint (`{ base: 1, md: 2 }`). */
  columns?: Responsive<GridColumnCount>;
  /**
   * Auto-fit as many columns as fit at this minimum width (any CSS length).
   * Takes precedence over `columns`.
   */
  minItemWidth?: string;
  /** Block-axis alignment of items in their cell. */
  align?: GridAlign;
}

const ALIGN_CLASS: Record<GridAlign, string> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  stretch: styles.alignStretch,
};

/** Grid — CSS grid with equal columns or an auto-fit track size. */
export const Grid = forwardRef<HTMLElement, GridProps>(function Grid(
  {
    as: Component = 'div',
    gap = 4,
    columns,
    minItemWidth,
    align,
    className,
    style,
    ...props
  },
  ref,
) {
  const columnClasses = minItemWidth
    ? [styles.autoFit]
    : responsiveClasses(columns, (prefix, n) =>
        prefix ? styles[`${prefix}Cols${n}`] : styles[`cols${n}`],
      );
  const vars: StyleWithVars | undefined = minItemWidth
    ? { '--ds-grid-min-item': minItemWidth, ...style }
    : undefined;
  return (
    <Component
      ref={ref}
      {...props}
      style={vars ?? style}
      className={cx(
        styles.grid,
        ...columnClasses,
        align && ALIGN_CLASS[align],
        gapClass(styles, gap),
        className,
      )}
    />
  );
});
Grid.displayName = 'Grid';
