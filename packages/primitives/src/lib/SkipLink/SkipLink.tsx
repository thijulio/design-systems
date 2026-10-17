import {
  forwardRef,
  type AnchorHTMLAttributes,
  type MouseEvent,
} from 'react';
import { cx } from '../_util/style';
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden';
import styles from './SkipLink.module.css';

export interface SkipLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'> {
  /** Fragment of the landmark to jump to, e.g. `#main-content`. */
  href: `#${string}`;
  /** The link text. Required: there is no default copy. */
  label: string;
}

/**
 * SkipLink — the first tab stop of a page shell. Visually hidden until it
 * takes focus, then shown as a pill at the top start corner.
 *
 * Activating it moves focus to the target (not only the scroll position) and
 * records the fragment in history. A target that is not focusable, such as
 * `<main>`, gets `tabindex="-1"`; give it one yourself to skip that write.
 * A handler that calls `preventDefault()` opts out.
 */
export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  function SkipLink({ href, label, onClick, className, ...props }, ref) {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      const doc = event.currentTarget.ownerDocument;
      const target = doc.getElementById(decodeURIComponent(href.slice(1)));
      if (!target) return;
      event.preventDefault();
      if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus();
      doc.defaultView?.history.pushState(null, '', href);
    };

    return (
      <VisuallyHidden
        ref={ref}
        as="a"
        focusable
        {...props}
        href={href}
        onClick={handleClick}
        className={cx(styles.skipLink, className)}
      >
        {label}
      </VisuallyHidden>
    );
  },
);
SkipLink.displayName = 'SkipLink';
