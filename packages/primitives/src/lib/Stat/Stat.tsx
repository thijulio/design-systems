import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../_util/style';
import type { HeadingLevel } from '../Heading/Heading';
import styles from './Stat.module.css';

export type StatTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
/**
 * `text` renders paragraphs. `dl` renders the label as a `<dt>` and the value
 * and caption as `<dd>`s in the root `<div>`, a group for a parent `<dl>`.
 */
export type StatMarkup = 'text' | 'dl';
/** `stacked` puts the value under the label; `inline` beside it, at the end. */
export type StatLayout = 'stacked' | 'inline';

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  /** The headline number or short value. */
  value: ReactNode;
  caption?: ReactNode;
  tone?: StatTone;
  /** Default `text`. Use `dl` when the stats sit in a `<dl>`. */
  markup?: StatMarkup;
  /** Default `stacked`. */
  layout?: StatLayout;
  /** `data-testid` for the value element, to read the figure alone. */
  valueTestId?: string;
  /**
   * Render the label as a heading of this level, so a stat that stands for
   * a section keeps its place in the page outline. The look is unchanged.
   * Ignored with `markup="dl"`.
   */
  headingLevel?: HeadingLevel;
}

const TONE_CLASS: Record<StatTone, string> = {
  neutral: styles.neutral,
  accent: styles.accent,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
};

const LAYOUT_CLASS: Record<StatLayout, string | undefined> = {
  stacked: undefined,
  inline: styles.inline,
};

/** Stat — a labelled headline figure with an optional caption. */
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
  {
    label,
    value,
    caption,
    tone = 'neutral',
    markup = 'text',
    layout = 'stacked',
    valueTestId,
    headingLevel,
    className,
    ...props
  },
  ref,
) {
  const heading =
    markup === 'text' && headingLevel !== undefined
      ? (`h${headingLevel}` as const)
      : undefined;
  const asHeading = heading !== undefined;
  const Term = markup === 'dl' ? 'dt' : (heading ?? 'p');
  const Detail = markup === 'dl' ? 'dd' : 'p';
  return (
    <div
      ref={ref}
      {...props}
      className={cx(
        styles.stat,
        TONE_CLASS[tone],
        LAYOUT_CLASS[layout],
        className,
      )}
    >
      <Term className={cx(styles.label, asHeading && styles.heading)}>
        {label}
      </Term>
      <Detail className={styles.value} data-testid={valueTestId}>
        {value}
      </Detail>
      {caption !== undefined && caption !== null && caption !== '' && (
        <Detail className={styles.caption}>{caption}</Detail>
      )}
    </div>
  );
});
Stat.displayName = 'Stat';
