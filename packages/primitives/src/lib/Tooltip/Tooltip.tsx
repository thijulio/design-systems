import {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../_util/style';
import { cloneAsChild, useSlotRef } from '../_util/slot';
import styles from './Tooltip.module.css';

export type TooltipPlacement = 'top' | 'bottom';

/**
 * How the tooltip relates to its trigger: `description` (default) sets
 * `aria-describedby`; `label` sets `aria-labelledby`, for an icon-only
 * trigger whose only name is the tooltip text (it avoids announcing the same
 * words twice).
 */
export type TooltipRelation = 'description' | 'label';

export interface TooltipProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'content'
> {
  /** The tooltip text. Required: there is no default copy. */
  content: ReactNode;
  /**
   * The trigger's content, or with `asChild` the single focusable element
   * (a link, a button) that becomes the trigger.
   */
  children?: ReactNode;
  /**
   * Make the single child element the trigger instead of rendering a
   * `<button>`. Props, className and ref are merged onto the child, which
   * must be focusable.
   */
  asChild?: boolean;
  /** Side of the trigger the tooltip opens on. Default `top`. */
  placement?: TooltipPlacement;
  relation?: TooltipRelation;
}

const RELATION_ATTR = {
  description: 'aria-describedby',
  label: 'aria-labelledby',
} as const;

/**
 * Tooltip — a short text shown while its trigger is hovered or focused.
 * Escape dismisses it; it stays hoverable. The trigger is focusable (a
 * `<button>` or the `asChild` element) and points at the `role="tooltip"`
 * node, which is always rendered so the reference resolves on the server.
 */
export const Tooltip = forwardRef<HTMLButtonElement, TooltipProps>(
  function Tooltip(
    {
      content,
      children,
      asChild = false,
      placement = 'top',
      relation = 'description',
      type = 'button',
      className,
      ...props
    },
    ref,
  ) {
    const tooltipId = useId();
    const slotRef = useSlotRef(ref, asChild ? children : undefined);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const open = (hovered || focused) && !dismissed;

    // Listen on the document so Escape also works while only hovered.
    useEffect(() => {
      if (!open) return undefined;
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setDismissed(true);
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }, [open]);

    const attr = RELATION_ATTR[relation];
    const own = props[attr];

    let trigger: ReactNode;
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const ids = cx(child.props[attr] as string | undefined, own, tooltipId);
      // The child's own value would win the merge; it is folded into `ids`.
      trigger = cloneAsChild(
        cloneElement(child, { [attr]: undefined }),
        { ...props, [attr]: ids, className },
        slotRef,
      );
    } else {
      trigger = (
        <button
          ref={ref}
          type={type}
          {...props}
          {...{ [attr]: cx(own, tooltipId) }}
          className={cx(styles.trigger, className)}
        >
          {children}
        </button>
      );
    }

    return (
      <span
        className={styles.root}
        data-state={open ? 'open' : 'closed'}
        onMouseEnter={() => {
          setHovered(true);
          setDismissed(false);
        }}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => {
          setFocused(true);
          setDismissed(false);
        }}
        onBlur={() => setFocused(false)}
      >
        {trigger}
        <span
          id={tooltipId}
          role="tooltip"
          data-state={open ? 'open' : 'closed'}
          className={cx(styles.tooltip, styles[placement])}
        >
          {content}
        </span>
      </span>
    );
  },
);
Tooltip.displayName = 'Tooltip';
