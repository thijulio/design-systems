import { forwardRef, type ElementType, type HTMLAttributes } from 'react';
import { cx } from '../_util/style';
import styles from './Text.module.css';

export type TextSize =
  'caption' | 'body-sm' | 'body' | 'lead' | 'h3' | 'h2' | 'h1' | 'display';

export type TextTone =
  | 'default'
  | 'secondary'
  | 'soft'
  | 'muted'
  | 'placeholder'
  | 'disabled'
  | 'inverse'
  | 'inverse-muted'
  | 'accent'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'inherit';

export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extra';
export type TextAlign = 'start' | 'center' | 'end';
export type TextTracking = 'tight' | 'normal' | 'eyebrow';
/** Max line length for readable prose: `prose` 48rem, `narrow` 42rem. */
export type TextMeasure = 'prose' | 'narrow';

/** Typographic props shared by Text and Heading. */
export interface TextStyleProps {
  size?: TextSize;
  tone?: TextTone;
  weight?: TextWeight;
  align?: TextAlign;
  transform?: 'uppercase';
  tracking?: TextTracking;
  /** Single line, clipped with an ellipsis. */
  truncate?: boolean;
  /** Break long unspaced strings (URLs, ids) anywhere. */
  wrap?: 'anywhere';
  /** Cap the line length so a paragraph stays readable on wide pages. */
  measure?: TextMeasure;
}

export interface TextProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>, TextStyleProps {
  /** Element to render; defaults to `p`. */
  as?: ElementType;
}

const SIZE_CLASS: Record<TextSize, string> = {
  caption: styles.caption,
  'body-sm': styles.bodySm,
  body: styles.body,
  lead: styles.lead,
  h3: styles.h3,
  h2: styles.h2,
  h1: styles.h1,
  display: styles.display,
};

const TONE_CLASS: Record<TextTone, string> = {
  default: styles.toneDefault,
  secondary: styles.toneSecondary,
  soft: styles.toneSoft,
  muted: styles.toneMuted,
  placeholder: styles.tonePlaceholder,
  disabled: styles.toneDisabled,
  inverse: styles.toneInverse,
  'inverse-muted': styles.toneInverseMuted,
  accent: styles.toneAccent,
  danger: styles.toneDanger,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  info: styles.toneInfo,
  inherit: styles.toneInherit,
};

const WEIGHT_CLASS: Record<TextWeight, string> = {
  regular: styles.regular,
  medium: styles.medium,
  semibold: styles.semibold,
  bold: styles.bold,
  extra: styles.extra,
};

const ALIGN_CLASS: Record<TextAlign, string> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
};

const TRACKING_CLASS: Record<TextTracking, string> = {
  tight: styles.trackingTight,
  normal: styles.trackingNormal,
  eyebrow: styles.trackingEyebrow,
};

const MEASURE_CLASS: Record<TextMeasure, string> = {
  prose: styles.measureProse,
  narrow: styles.measureNarrow,
};

/** Module class names for a set of text style props (shared with Heading). */
export function textClasses({
  size = 'body',
  tone = 'default',
  weight,
  align,
  transform,
  tracking,
  truncate,
  wrap,
  measure,
}: TextStyleProps): string {
  return cx(
    styles.text,
    SIZE_CLASS[size],
    TONE_CLASS[tone],
    weight && WEIGHT_CLASS[weight],
    align && ALIGN_CLASS[align],
    transform === 'uppercase' && styles.uppercase,
    tracking && TRACKING_CLASS[tracking],
    truncate && styles.truncate,
    wrap === 'anywhere' && styles.wrapAnywhere,
    measure && MEASURE_CLASS[measure],
  );
}

/** Text — body copy on the type scale, with semantic tone. */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as: Component = 'p',
    size,
    tone,
    weight,
    align,
    transform,
    tracking,
    truncate,
    wrap,
    measure,
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
        textClasses({
          size,
          tone,
          weight,
          align,
          transform,
          tracking,
          truncate,
          wrap,
          measure,
        }),
        className,
      )}
    />
  );
});
Text.displayName = 'Text';
