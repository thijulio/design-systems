import {
  forwardRef,
  isValidElement,
  type AnchorHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../_util/style';
import { cloneAsChild, useSlotRef } from '../_util/slot';
import { Icon } from '../Icon/Icon';
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden';
import styles from './Link.module.css';

export type LinkTone = 'accent' | 'inherit' | 'muted';
export type LinkUnderline = 'always' | 'hover' | 'none';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Style the single child element instead of rendering an `<a>` (router
   * links). Props, className and ref are merged onto the child.
   */
  asChild?: boolean;
  tone?: LinkTone;
  underline?: LinkUnderline;
  /** Opens in a new tab (`target="_blank"`, safe `rel`) with a trailing icon. */
  external?: boolean;
  /** Visually hidden suffix for external links, e.g. a translated "(opens in a new tab)". */
  externalLabel?: string;
  children?: ReactNode;
}

const TONE_CLASS: Record<LinkTone, string> = {
  accent: styles.accent,
  inherit: styles.inherit,
  muted: styles.muted,
};

const UNDERLINE_CLASS: Record<LinkUnderline, string> = {
  always: styles.underlineAlways,
  hover: styles.underlineHover,
  none: styles.underlineNone,
};

/** Link — inline text link; `asChild` styles a router link component. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    asChild = false,
    tone = 'accent',
    underline = 'always',
    external = false,
    externalLabel,
    className,
    children,
    ...props
  },
  ref,
) {
  const slotRef = useSlotRef(ref, asChild ? children : undefined);
  const classes = cx(
    styles.link,
    TONE_CLASS[tone],
    UNDERLINE_CLASS[underline],
    className,
  );
  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : undefined;
  const suffix = external ? (
    <>
      <Icon name="external" size={14} className={styles.externalIcon} />
      {/* Leading space keeps the computed name "Docs (opens…)", not "Docs(opens…)". */}
      {externalLabel && <VisuallyHidden> {externalLabel}</VisuallyHidden>}
    </>
  ) : null;

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ children?: ReactNode }>;
    return cloneAsChild(
      child,
      { ...externalProps, ...props, className: classes },
      slotRef,
      external ? (
        <>
          {child.props.children}
          {suffix}
        </>
      ) : undefined,
    );
  }

  return (
    <a ref={ref} {...externalProps} {...props} className={classes}>
      {children}
      {suffix}
    </a>
  );
});
Link.displayName = 'Link';
