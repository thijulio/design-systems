import { forwardRef, type ElementType, type HTMLAttributes } from 'react';
import { cx } from '../_util/style';
import { gapClass, type Space } from '../_util/space';
import styles from './Inline.module.css';

export type InlineAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch';
export type InlineJustify = 'start' | 'center' | 'end' | 'between';

export interface InlineProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  gap?: Space;
  /** Cross-axis alignment. */
  align?: InlineAlign;
  /** Main-axis distribution. */
  justify?: InlineJustify;
  /** Let items flow onto new lines. */
  wrap?: boolean;
}

const ALIGN_CLASS: Record<InlineAlign, string> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  baseline: styles.alignBaseline,
  stretch: styles.alignStretch,
};

const JUSTIFY_CLASS: Record<InlineJustify, string> = {
  start: styles.justifyStart,
  center: styles.justifyCenter,
  end: styles.justifyEnd,
  between: styles.justifyBetween,
};

/** Inline — a horizontal row of items with a gap (cluster). */
export const Inline = forwardRef<HTMLElement, InlineProps>(function Inline(
  {
    as: Component = 'div',
    gap = 2,
    align = 'center',
    justify,
    wrap = false,
    className,
    ...props
  },
  ref,
) {
  return (
    <Component
      ref={ref}
      {...props}
      className={cx(
        styles.inline,
        ALIGN_CLASS[align],
        justify && JUSTIFY_CLASS[justify],
        wrap && styles.wrap,
        gapClass(styles, gap),
        className,
      )}
    />
  );
});
Inline.displayName = 'Inline';
