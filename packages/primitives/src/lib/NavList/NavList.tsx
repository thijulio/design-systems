import {
  forwardRef,
  isValidElement,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../_util/style';
import { cloneAsChild, useSlotRef } from '../_util/slot';
import { responsiveClasses, type Responsive } from '../_util/responsive';
import type { Space } from '../_util/space';
import styles from './NavList.module.css';

export type NavListOrientation = 'horizontal' | 'vertical';
/** `text`: bare links, the current one underlined. `block`: padded rows. */
export type NavListVariant = 'text' | 'block';
/** `inverse` for a nav that sits on `--ds-surface-inverse`. */
export type NavListTone = 'default' | 'inverse';

export interface NavListProps extends HTMLAttributes<HTMLElement> {
  /**
   * Names the landmark. Required: a page with more than one `nav` needs each
   * one named, and screen readers already append "navigation".
   */
  'aria-label': string;
  /** Row (wrapping) or column, optionally per breakpoint. */
  orientation?: Responsive<NavListOrientation>;
  /** Space between items, optionally per breakpoint. Default 2. */
  gap?: Responsive<Space>;
  variant?: NavListVariant;
  tone?: NavListTone;
  /**
   * Content after the list, inside the landmark (e.g. account controls).
   * The nav then lays the list and the actions out in a wrapping row.
   */
  actions?: ReactNode;
  /** Class for the `ul` (the `nav` takes `className`). */
  listClassName?: string;
}

const VARIANT_CLASS: Record<NavListVariant, string> = {
  text: styles.text,
  block: styles.block,
};

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function hasContent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false;
}

/**
 * NavList — a named `nav` landmark around a `ul` of `NavItem`s. The current
 * item is styled from `aria-current="page"`, so a router link that sets it
 * (React Router's `NavLink`) needs no active class.
 */
export const NavList = forwardRef<HTMLElement, NavListProps>(function NavList(
  {
    orientation = 'horizontal',
    gap = 2,
    variant = 'text',
    tone = 'default',
    actions,
    listClassName,
    className,
    children,
    ...props
  },
  ref,
) {
  const withActions = hasContent(actions);
  return (
    <nav
      ref={ref}
      {...props}
      className={cx(
        styles.root,
        VARIANT_CLASS[variant],
        tone === 'inverse' && styles.inverse,
        withActions && styles.withActions,
        className,
      )}
    >
      <ul
        role="list"
        className={cx(
          styles.list,
          ...responsiveClasses(orientation, (prefix, value) =>
            prefix ? styles[`${prefix}${capitalise(value)}`] : styles[value],
          ),
          ...responsiveClasses(gap, (prefix, n) =>
            prefix ? styles[`${prefix}G${n}`] : styles[`g${n}`],
          ),
          listClassName,
        )}
      >
        {children}
      </ul>
      {withActions && actions}
    </nav>
  );
});
NavList.displayName = 'NavList';

export interface NavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Style the single child element instead of rendering an `<a>` (router
   * links, or a `button` that navigates). Props, className and ref are
   * merged onto the child.
   */
  asChild?: boolean;
  /**
   * Marks the item as the current page (`aria-current="page"`). Leave it
   * unset for a router link that sets `aria-current` itself.
   */
  current?: boolean;
  children?: ReactNode;
}

/** NavItem — one `li` of a `NavList`, holding its link. */
export const NavItem = forwardRef<HTMLAnchorElement, NavItemProps>(
  function NavItem(
    { asChild = false, current, className, children, ...props },
    ref,
  ) {
    const slotRef = useSlotRef(ref, asChild ? children : undefined);
    const itemProps = {
      ...props,
      ...(current === undefined
        ? undefined
        : { 'aria-current': current ? ('page' as const) : undefined }),
      className: cx(styles.item, className),
    };

    if (asChild && isValidElement(children)) {
      return (
        <li>
          {cloneAsChild(
            children as ReactElement<Record<string, unknown>>,
            itemProps,
            slotRef,
          )}
        </li>
      );
    }

    return (
      <li>
        <a ref={ref} {...itemProps}>
          {children}
        </a>
      </li>
    );
  },
);
NavItem.displayName = 'NavItem';
