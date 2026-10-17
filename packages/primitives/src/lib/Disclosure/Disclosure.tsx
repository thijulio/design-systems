import {
  forwardRef,
  useId,
  useState,
  type DetailsHTMLAttributes,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { cx } from '../_util/style';
import type { HeadingLevel } from '../Heading/Heading';
import { Icon } from '../Icon/Icon';
import styles from './Disclosure.module.css';

/**
 * `default`: semibold toggle row, chevron at its far end.
 * `plain`: the toggle inherits weight and colour from its context and the
 * chevron sits right after the text; for a quiet "show more" inside a row.
 */
export type DisclosureVariant = 'default' | 'plain';

export interface DisclosureProps extends Omit<
  DetailsHTMLAttributes<HTMLElement>,
  'open' | 'onToggle' | 'children'
> {
  /** Always-visible toggle content (`<summary>`, or the heading's button). */
  summary: ReactNode;
  /**
   * Trailing content inside the toggle, after `summary` (e.g. a badge). It
   * wraps under the summary when the row runs out of space.
   */
  summaryEnd?: ReactNode;
  /**
   * Accordion mode: renders `<h{level}><button aria-expanded aria-controls>`
   * and a `hidden` content region instead of `<details>`/`<summary>`. Use it
   * when the toggle is also a section heading.
   */
  headingLevel?: HeadingLevel;
  variant?: DisclosureVariant;
  children?: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial state. */
  defaultOpen?: boolean;
  /** Called with the new state after the user toggles it. */
  onToggle?: (open: boolean) => void;
}

/**
 * Disclosure — show/hide content. Native `<details>`/`<summary>` by default;
 * with `headingLevel`, a heading wrapping a toggle button (accordion pattern).
 * The ref points at the root: `<details>`, or a `<div>` in accordion mode.
 */
export const Disclosure = forwardRef<HTMLElement, DisclosureProps>(
  function Disclosure(
    {
      summary,
      summaryEnd,
      headingLevel,
      variant = 'default',
      children,
      open,
      defaultOpen = false,
      onToggle,
      className,
      ...props
    },
    ref,
  ) {
    const [innerOpen, setInnerOpen] = useState(defaultOpen);
    const contentId = useId();
    const controlled = open !== undefined;
    const isOpen = controlled ? open : innerOpen;

    const change = (next: boolean) => {
      if (next === isOpen) return;
      if (!controlled) setInnerOpen(next);
      onToggle?.(next);
    };

    const rootClass = cx(
      styles.disclosure,
      variant === 'plain' && styles.plain,
      className,
    );
    const toggleContent = (
      <>
        <span className={styles.summaryMain}>
          <span className={styles.summaryText}>{summary}</span>
          {summaryEnd ? (
            <span className={styles.summaryEnd}>{summaryEnd}</span>
          ) : null}
        </span>
        <Icon name="chevron-down" size={18} className={styles.chevron} />
      </>
    );

    if (headingLevel !== undefined) {
      const HeadingTag = `h${headingLevel}` as const;
      return (
        <div ref={ref as Ref<HTMLDivElement>} {...props} className={rootClass}>
          <HeadingTag className={styles.heading}>
            <button
              type="button"
              className={cx(styles.summary, styles.trigger)}
              aria-expanded={isOpen}
              aria-controls={contentId}
              onClick={() => change(!isOpen)}
            >
              {toggleContent}
            </button>
          </HeadingTag>
          <div id={contentId} className={styles.content} hidden={!isOpen}>
            {children}
          </div>
        </div>
      );
    }

    return (
      <details
        ref={ref as Ref<HTMLDetailsElement>}
        {...props}
        open={isOpen}
        onToggle={(event: SyntheticEvent<HTMLDetailsElement>) =>
          change(event.currentTarget.open)
        }
        className={rootClass}
      >
        <summary className={styles.summary}>{toggleContent}</summary>
        <div className={styles.content}>{children}</div>
      </details>
    );
  },
);
Disclosure.displayName = 'Disclosure';
