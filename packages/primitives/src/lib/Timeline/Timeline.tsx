import {
  forwardRef,
  type LiHTMLAttributes,
  type OlHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../_util/style';
import { gapClass, type Space } from '../_util/space';
import styles from './Timeline.module.css';

export type TimelineMarker = 'dot' | 'none';
export type TimelineTone =
  'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface TimelineProps extends OlHTMLAttributes<HTMLOListElement> {
  /** Space between items. Default 3. */
  gap?: Space;
  /** `dot` (default) draws a dot before each item, in the item's tone. */
  marker?: TimelineMarker;
  /** Draw a rule along the inline start edge, through the markers. */
  rail?: boolean;
}

const TONE_CLASS: Record<TimelineTone, string> = {
  neutral: styles.toneNeutral,
  accent: styles.toneAccent,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
};

/**
 * Timeline — an `ol` of events, in the order the caller gives them. It
 * carries `role="list"`, which Safari drops from lists without markers. The
 * dots and the rail are drawn in CSS, so its children stay plain `li`.
 */
export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(
  function Timeline(
    {
      gap = 3,
      marker = 'dot',
      rail = false,
      role = 'list',
      className,
      ...props
    },
    ref,
  ) {
    return (
      <ol
        ref={ref}
        role={role}
        {...props}
        className={cx(
          styles.timeline,
          marker === 'dot' && styles.dots,
          rail && styles.rail,
          gapClass(styles, gap),
          className,
        )}
      />
    );
  },
);
Timeline.displayName = 'Timeline';

export interface TimelineItemProps extends Omit<
  LiHTMLAttributes<HTMLLIElement>,
  'title'
> {
  /** What happened. Rendered first on the item's top line. */
  title?: ReactNode;
  /** When it happened, as shown to the reader. */
  time?: ReactNode;
  /**
   * The machine-readable instant (`2026-03-01`, an ISO date-time…). When set,
   * `time` renders in a `<time dateTime>`; otherwise in a `span`.
   */
  dateTime?: string;
  /** Colour of the item's dot. Default `accent`. */
  tone?: TimelineTone;
}

function hasContent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false;
}

/**
 * TimelineItem — one `li`. With `title` or `time` it lays them out on a
 * wrapping top line and puts the children under it. Without either, it
 * renders the children as they are, so a caller can compose its own entry.
 */
export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(
  function TimelineItem(
    { title, time, dateTime, tone = 'accent', className, children, ...props },
    ref,
  ) {
    const hasTitle = hasContent(title);
    const hasTime = hasContent(time);
    const hasHeader = hasTitle || hasTime;
    return (
      <li
        ref={ref}
        {...props}
        className={cx(styles.item, TONE_CLASS[tone], className)}
      >
        {hasHeader ? (
          <div className={styles.header}>
            {hasTitle ? <div className={styles.title}>{title}</div> : null}
            {/* Keeps the title and the time apart when read as text. */}
            {hasTitle && hasTime ? ' ' : null}
            {hasTime && dateTime ? (
              <time dateTime={dateTime} className={styles.time}>
                {time}
              </time>
            ) : null}
            {hasTime && !dateTime ? (
              <span className={styles.time}>{time}</span>
            ) : null}
          </div>
        ) : null}
        {hasHeader && hasContent(children) ? (
          <div className={styles.body}>{children}</div>
        ) : null}
        {hasHeader ? null : children}
      </li>
    );
  },
);
TimelineItem.displayName = 'TimelineItem';
