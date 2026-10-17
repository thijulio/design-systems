import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cx, type StyleWithVars } from '../_util/style';
import { composeRefs } from '../_util/refs';
import { Icon } from '../Icon/Icon';
import styles from './Table.module.css';

export type TableAlign = 'start' | 'end' | 'center';

export type TableSortDirection = 'ascending' | 'descending';

export interface TableSortState {
  /** Key of the sorted column. */
  key: string;
  direction: TableSortDirection;
}

export interface TableColumnSort {
  /**
   * Directions a press steps through, in order, before the column returns to
   * unsorted. Defaults to ascending, then descending.
   */
  directions?: ReadonlyArray<TableSortDirection>;
}

/**
 * What a press on a sort button does next, read as the button's description
 * (e.g. "Sort ascending", "Sort descending", "Remove sort").
 */
export interface TableSortLabels {
  ascending: string;
  descending: string;
  /** The press clears the sort. */
  none: string;
}

export interface TableColumn<T> {
  /** Stable column key (React key). */
  key: string;
  /**
   * Column header. Omit it for an empty corner cell (a plain `<td>`), e.g.
   * above a row-header column.
   */
  header?: ReactNode;
  cell: (row: T) => ReactNode;
  align?: TableAlign;
  /** Any CSS width for the column (applied to its header cell). */
  width?: string;
  headerClassName?: string;
  cellClassName?: string;
  /** Body cells label their row: `<th scope="row">` instead of `<td>`. */
  rowHeader?: boolean;
  /**
   * Makes the header a sort button with `aria-sort`. Needs the table's
   * `sortState`, `onSortChange` and `sortLabels`.
   */
  sort?: TableColumnSort;
}

/** Controlled sorting: the caller sorts `rows` and owns the state. */
export interface TableSortProps {
  /** The sorted column and direction, or `null` while unsorted. */
  sortState: TableSortState | null;
  /** Called with the next state when a sort button is pressed. */
  onSortChange: (next: TableSortState | null) => void;
  /** Sort button descriptions. Required: no default copy. */
  sortLabels: TableSortLabels;
}

interface TableUnsortedProps {
  sortState?: undefined;
  onSortChange?: undefined;
  sortLabels?: undefined;
}

interface TableBaseProps<T> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  columns: ReadonlyArray<TableColumn<T>>;
  rows: ReadonlyArray<T>;
  getRowKey: (row: T) => string;
  /** Table caption; also names the scroll region when the table overflows. */
  caption?: ReactNode;
  /** Keep the caption for assistive technology only. */
  captionHidden?: boolean;
  /** Shown instead of the table when there are no rows. Required: no default copy. */
  emptyLabel: ReactNode;
  /** Stick the header row to the top of the scroll container. */
  stickyHeader?: boolean;
  density?: 'compact' | 'normal';
}

export type TableProps<T> = TableBaseProps<T> &
  (TableSortProps | TableUnsortedProps);

const ALIGN_CLASS: Record<TableAlign, string> = {
  start: styles.alignStart,
  end: styles.alignEnd,
  center: styles.alignCenter,
};

const DEFAULT_SORT_DIRECTIONS: ReadonlyArray<TableSortDirection> = [
  'ascending',
  'descending',
];

const SORT_ICON = {
  ascending: 'arrow-up',
  descending: 'arrow-down',
  none: 'arrow-up-down',
} as const;

/** The state a press on this column's sort button moves to. */
function nextSortState(
  key: string,
  sort: TableColumnSort,
  current: TableSortState | null,
): TableSortState | null {
  const directions = sort.directions?.length
    ? sort.directions
    : DEFAULT_SORT_DIRECTIONS;
  const index =
    current?.key === key ? directions.indexOf(current.direction) : -1;
  const direction = directions[index + 1];
  return direction ? { key, direction } : null;
}

/**
 * Whether the element is wider than its box. Measured after layout, so the
 * server render and first client render agree (not scrollable). Both the box
 * and its first child (the table) are observed, so content that grows without
 * resizing the box (an async cell, a longer label) re-measures too.
 */
function useHorizontalOverflow(
  ref: { current: HTMLElement | null },
  deps: readonly unknown[],
): boolean {
  const [overflowing, setOverflowing] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () =>
      setOverflowing(element.scrollWidth > element.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    return () => observer.disconnect();
  }, deps);
  return overflowing;
}

function TableInner<T>(
  {
    columns,
    rows,
    getRowKey,
    caption,
    captionHidden = false,
    emptyLabel,
    stickyHeader = false,
    density = 'normal',
    sortState = null,
    onSortChange,
    sortLabels,
    className,
    'aria-label': ariaLabel,
    ...props
  }: TableProps<T>,
  ref: Ref<HTMLDivElement>,
) {
  const captionId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const setRefs = useMemo(() => composeRefs(scrollRef, ref), [ref]);
  const isEmpty = rows.length === 0;
  const overflowing = useHorizontalOverflow(scrollRef, [
    isEmpty,
    rows.length,
    columns.length,
  ]);

  if (isEmpty) {
    return (
      <div ref={setRefs} {...props} className={cx(styles.empty, className)}>
        {emptyLabel}
      </div>
    );
  }

  const hasCaption = caption !== undefined && caption !== null;
  const named = hasCaption || Boolean(ariaLabel);
  // Only a scrollable table needs a keyboard stop, so keyboard users can
  // scroll it; a named one is also a region. `aria-label` is never put on a
  // plain div (it is prohibited there): without the region it names the
  // table instead.
  const regionProps =
    overflowing && named
      ? {
          role: 'region',
          tabIndex: 0,
          'aria-label': ariaLabel,
          'aria-labelledby': ariaLabel ? undefined : captionId,
        }
      : overflowing
        ? { tabIndex: 0 }
        : {};
  const isRegion = overflowing && named;
  // Sorting needs both the handler and its copy; a column without a header
  // has nothing to name its button, so it stays plain.
  const sorting =
    onSortChange && sortLabels ? { onSortChange, sortLabels } : null;
  const sortOf = (column: TableColumn<T>) =>
    sorting && column.header != null ? column.sort : undefined;
  const hasSortable = columns.some((column) => sortOf(column));
  const sortLabelId = (state: keyof TableSortLabels) =>
    `${captionId}-sort-${state}`;

  return (
    <div
      ref={setRefs}
      {...regionProps}
      {...props}
      className={cx(styles.scroll, className)}
    >
      <table
        aria-label={!isRegion && !hasCaption ? ariaLabel : undefined}
        className={cx(
          styles.table,
          density === 'compact' ? styles.compact : styles.normal,
          stickyHeader && styles.sticky,
        )}
      >
        {hasCaption && (
          <caption
            id={captionId}
            className={cx(
              styles.caption,
              captionHidden && styles.visuallyHidden,
            )}
          >
            {caption}
          </caption>
        )}
        <thead>
          <tr>
            {columns.map((column) => {
              const widthVars: StyleWithVars | undefined = column.width
                ? { '--ds-table-column-width': column.width }
                : undefined;
              const headerClass = cx(
                styles.th,
                column.width && styles.sized,
                column.align && ALIGN_CLASS[column.align],
                column.headerClassName,
              );
              if (column.header == null) {
                return (
                  <td
                    key={column.key}
                    style={widthVars}
                    className={headerClass}
                  />
                );
              }
              const sort = sortOf(column);
              if (!sort || !sorting) {
                return (
                  <th
                    key={column.key}
                    scope="col"
                    style={widthVars}
                    className={headerClass}
                  >
                    {column.header}
                  </th>
                );
              }
              const direction =
                sortState?.key === column.key ? sortState.direction : null;
              const next = nextSortState(column.key, sort, sortState);
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={direction ?? 'none'}
                  style={widthVars}
                  className={headerClass}
                >
                  <button
                    type="button"
                    className={styles.sortButton}
                    aria-describedby={sortLabelId(
                      next ? next.direction : 'none',
                    )}
                    onClick={() => sorting.onSortChange(next)}
                  >
                    <span>{column.header}</span>
                    <Icon
                      name={SORT_ICON[direction ?? 'none']}
                      size={16}
                      className={cx(
                        styles.sortIcon,
                        direction && styles.sortIconActive,
                      )}
                    />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className={styles.row}>
              {columns.map((column) => {
                const cellClass = cx(
                  styles.td,
                  column.rowHeader && styles.rowHeader,
                  column.align && ALIGN_CLASS[column.align],
                  column.cellClassName,
                );
                return column.rowHeader ? (
                  <th key={column.key} scope="row" className={cellClass}>
                    {column.cell(row)}
                  </th>
                ) : (
                  <td key={column.key} className={cellClass}>
                    {column.cell(row)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {sorting && hasSortable && (
        // Hidden description targets: `aria-describedby` still reads them.
        <>
          <span hidden id={sortLabelId('ascending')}>
            {sorting.sortLabels.ascending}
          </span>
          <span hidden id={sortLabelId('descending')}>
            {sorting.sortLabels.descending}
          </span>
          <span hidden id={sortLabelId('none')}>
            {sorting.sortLabels.none}
          </span>
        </>
      )}
    </div>
  );
}

const TableWithRef = forwardRef<HTMLDivElement, TableProps<unknown>>(
  TableInner,
);
TableWithRef.displayName = 'Table';

/**
 * Table — data table from column definitions. The root is the horizontal
 * scroll container; when the table overflows it becomes a focusable region
 * named by the caption (or `aria-label`). With no rows it renders `emptyLabel`.
 * A `rowHeader` column labels each row; `sort` columns get a header button
 * and `aria-sort`, driven by `sortState` / `onSortChange`.
 */
export const Table = TableWithRef as unknown as <T>(
  props: TableProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement | null;
