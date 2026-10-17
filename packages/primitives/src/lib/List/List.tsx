import {
  forwardRef,
  type ElementType,
  type LiHTMLAttributes,
  type OlHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../_util/style';
import { gapClass, type Space } from '../_util/space';
import { responsiveClasses, type Responsive } from '../_util/responsive';
import styles from './List.module.css';
import itemStyles from './ListItem.module.css';

export type ListMarker = 'none' | 'disc' | 'decimal';
export type ListItemAlign = 'start' | 'center';
export type ListColumnCount = 1 | 2 | 3 | 4 | 5 | 6;

export interface ListProps extends OlHTMLAttributes<HTMLElement> {
  /** `ul` (default), or `ol` when the order carries meaning. */
  as?: 'ul' | 'ol';
  /** Space between items. With `divided`, the space on each side of a rule. */
  gap?: Space;
  /** Draw a subtle rule between items. */
  divided?: boolean;
  /** Item marker. `none` (default) drops the bullets and the indent. */
  marker?: ListMarker;
  /**
   * Lay the items out as a grid of equal columns, optionally per breakpoint
   * (`{ base: 1, md: 3 }`). `gap` then spaces rows and columns. Unset keeps
   * the single column. `divided` is meant for the single column.
   */
  columns?: Responsive<ListColumnCount>;
}

const MARKER_CLASS: Record<Exclude<ListMarker, 'none'>, string> = {
  disc: styles.markerDisc,
  decimal: styles.markerDecimal,
};

/**
 * List — a `ul`/`ol` laid out as a column, or as a grid with `columns`. It
 * carries `role="list"`, which Safari drops from lists without markers. Pass
 * `role` only to replace it on purpose (e.g. `role="alert"` on a list of
 * errors).
 */
export const List = forwardRef<HTMLElement, ListProps>(function List(
  {
    as = 'ul',
    gap = 0,
    divided = false,
    marker = 'none',
    columns,
    role = 'list',
    className,
    ...props
  },
  ref,
) {
  const Component = as as ElementType;
  return (
    <Component
      ref={ref}
      role={role}
      {...props}
      className={cx(
        styles.list,
        divided && styles.divided,
        marker !== 'none' && MARKER_CLASS[marker],
        columns !== undefined && styles.grid,
        ...responsiveClasses(columns, (prefix, n) =>
          prefix ? styles[`${prefix}Cols${n}`] : styles[`cols${n}`],
        ),
        gapClass(styles, gap),
        className,
      )}
    />
  );
});
List.displayName = 'List';

export interface ListItemProps extends LiHTMLAttributes<HTMLLIElement> {
  /**
   * Trailing controls. When set, the item becomes a row: the children fill
   * the growing slot and the actions sit at its end, wrapping under it when
   * the row runs out of space.
   */
  actions?: ReactNode;
  /** Cross-axis alignment of the row's slots (only with `actions`). */
  align?: ListItemAlign;
  /** Space between the row's slots and between actions. Default 3. */
  gap?: Space;
}

function hasContent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false;
}

/** ListItem — an `li`, optionally a row with a growing slot and actions. */
export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  function ListItem(
    { actions, align = 'center', gap = 3, className, children, ...props },
    ref,
  ) {
    if (!hasContent(actions)) {
      return (
        <li ref={ref} {...props} className={cx(itemStyles.item, className)}>
          {children}
        </li>
      );
    }
    return (
      <li
        ref={ref}
        {...props}
        className={cx(
          itemStyles.item,
          itemStyles.row,
          align === 'start' ? itemStyles.alignStart : itemStyles.alignCenter,
          gapClass(itemStyles, gap),
          className,
        )}
      >
        <div className={itemStyles.grow}>{children}</div>
        <div className={itemStyles.actions}>{actions}</div>
      </li>
    );
  },
);
ListItem.displayName = 'ListItem';
