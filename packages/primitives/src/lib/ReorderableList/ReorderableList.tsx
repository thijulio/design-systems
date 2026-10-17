import {
  forwardRef,
  useState,
  type OlHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { Icon } from '../Icon/Icon';
import {
  IconButton,
  type IconButtonSize,
  type IconButtonVariant,
} from '../IconButton/IconButton';
import { Inline } from '../Inline/Inline';
import { List, ListItem } from '../List/List';
import { LiveRegion } from '../LiveRegion/LiveRegion';
import type { Space } from '../_util/space';

export interface ReorderableListProps<T> extends Omit<
  OlHTMLAttributes<HTMLElement>,
  'children'
> {
  /** The items in their current order. The caller owns the order. */
  items: readonly T[];
  /** Stable key of an item (React key, and how a move is tracked). */
  getKey: (item: T) => string;
  /** Content of an item's row; the move controls sit at its end. */
  renderItem: (item: T, index: number) => ReactNode;
  /**
   * Asks the caller to move `item` from index `from` to index `to`. Called
   * only for a real move: a press past either end is refused.
   */
  onMove: (item: T, to: number, from: number) => void;
  /** Accessible name of an item's move-up control. No default copy. */
  moveUpLabel: (item: T, index: number) => string;
  /** Accessible name of an item's move-down control. No default copy. */
  moveDownLabel: (item: T, index: number) => string;
  /**
   * Announces the moved item's new place, e.g.
   * `(item, position, total) => \`${item.name}: ${position} of ${total}\``.
   * `position` counts from 1. There is no default copy.
   */
  announcement: (item: T, position: number, total: number) => string;
  /** `ol` (default), since the order carries meaning, or `ul`. */
  as?: 'ol' | 'ul';
  /** Space between items. Default 2. */
  gap?: Space;
  /** Draw a subtle rule between items. */
  divided?: boolean;
  /** Extra class on every `li`. */
  itemClassName?: string;
  /** `data-testid` for an item's `li`. */
  itemTestId?: (item: T) => string;
  /** `data-testid` for an item's move-up control. */
  moveUpTestId?: (item: T) => string;
  /** `data-testid` for an item's move-down control. */
  moveDownTestId?: (item: T) => string;
  /** `data-testid` for the live announcement. */
  announcementTestId?: string;
  /** Size of the move controls. Default `sm`. */
  buttonSize?: IconButtonSize;
  /** Variant of the move controls. Default `ghost`. */
  buttonVariant?: IconButtonVariant;
}

function ReorderableListInner<T>(
  {
    items,
    getKey,
    renderItem,
    onMove,
    moveUpLabel,
    moveDownLabel,
    announcement,
    as = 'ol',
    gap = 2,
    divided,
    itemClassName,
    itemTestId,
    moveUpTestId,
    moveDownTestId,
    announcementTestId,
    buttonSize = 'sm',
    buttonVariant = 'ghost',
    ...props
  }: ReorderableListProps<T>,
  ref: Ref<HTMLElement>,
) {
  const [movedKey, setMovedKey] = useState<string | null>(null);
  const total = items.length;

  // The announcement follows the moved item to wherever the caller put it.
  // Every real move changes its position, so the text always changes and is
  // read again.
  const movedIndex =
    movedKey === null
      ? -1
      : items.findIndex((item) => getKey(item) === movedKey);
  const message =
    movedIndex < 0
      ? ''
      : announcement(items[movedIndex], movedIndex + 1, total);

  const move = (item: T, from: number, to: number) => {
    if (to < 0 || to >= total) return;
    setMovedKey(getKey(item));
    onMove(item, to, from);
  };

  return (
    <>
      <List ref={ref} as={as} gap={gap} divided={divided} {...props}>
        {items.map((item, index) => (
          <ListItem
            key={getKey(item)}
            className={itemClassName}
            data-testid={itemTestId?.(item)}
            actions={
              <Inline as="span" gap={1}>
                {/* Never native `disabled` at either end: a control disabled
                    under the keyboard drops focus. It stays focusable,
                    `aria-disabled`, and refuses the press. */}
                <IconButton
                  label={moveUpLabel(item, index)}
                  icon={<Icon name="chevron-up" size={16} />}
                  size={buttonSize}
                  variant={buttonVariant}
                  aria-disabled={index === 0}
                  onClick={() => move(item, index, index - 1)}
                  data-testid={moveUpTestId?.(item)}
                />
                <IconButton
                  label={moveDownLabel(item, index)}
                  icon={<Icon name="chevron-down" size={16} />}
                  size={buttonSize}
                  variant={buttonVariant}
                  aria-disabled={index === total - 1}
                  onClick={() => move(item, index, index + 1)}
                  data-testid={moveDownTestId?.(item)}
                />
              </Inline>
            }
          >
            {renderItem(item, index)}
          </ListItem>
        ))}
      </List>
      <LiveRegion data-testid={announcementTestId}>{message}</LiveRegion>
    </>
  );
}

const ReorderableListWithRef = forwardRef<
  HTMLElement,
  ReorderableListProps<unknown>
>(ReorderableListInner);
ReorderableListWithRef.displayName = 'ReorderableList';

/**
 * ReorderableList — an ordered list whose items move with a move-up and a
 * move-down button each, so reordering never needs a pointer or a drag. The
 * items are keyed, so focus stays on the pressed control while its row
 * moves. A visually hidden polite LiveRegion, rendered after the list,
 * announces the moved item's new position. `ref`, `className` and other DOM
 * props go to the list element; every string comes from the caller.
 */
export const ReorderableList = ReorderableListWithRef as unknown as <T>(
  props: ReorderableListProps<T> & { ref?: Ref<HTMLElement> },
) => ReactElement | null;
