import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../_util/style';
import {
  textClasses,
  type TextAlign,
  type TextSize,
  type TextTone,
  type TextTracking,
  type TextWeight,
} from '../Text/Text';
import styles from './Heading.module.css';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps
  extends Omit<HTMLAttributes<HTMLHeadingElement>, 'color'> {
  /** Document outline level; renders `h{level}`. */
  level: HeadingLevel;
  /** Visual size, independent of the level. Defaults by level. */
  size?: TextSize;
  tone?: TextTone;
  /** Defaults to bold for levels 1–2, semibold for 3–6. */
  weight?: TextWeight;
  align?: TextAlign;
  tracking?: TextTracking;
  truncate?: boolean;
}

const DEFAULT_SIZE: Record<HeadingLevel, TextSize> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'body',
  5: 'body',
  6: 'body',
};

/** Heading — semantic heading level decoupled from its visual size. */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  function Heading(
    {
      level,
      size,
      tone,
      weight,
      align,
      tracking,
      truncate,
      className,
      ...props
    },
    ref,
  ) {
    const Tag = `h${level}` as const;
    return (
      <Tag
        ref={ref}
        {...props}
        className={cx(
          styles.heading,
          textClasses({
            size: size ?? DEFAULT_SIZE[level],
            tone,
            weight: weight ?? (level <= 2 ? 'bold' : 'semibold'),
            align,
            tracking,
            truncate,
          }),
          className,
        )}
      />
    );
  },
);
Heading.displayName = 'Heading';
