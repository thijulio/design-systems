import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../_util/style';
import type { Space } from '../_util/space';
import { Heading } from '../Heading/Heading';
import { Inline } from '../Inline/Inline';
import { Text } from '../Text/Text';
import styles from './Card.module.css';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
/** Explicit block / inline padding from the spacing scale, e.g. `{ block: 4, inline: 6 }`. */
export interface CardPaddingSpace {
  block: Space;
  inline: Space;
}
export type CardSurface = 'raised' | 'flat' | 'sunken' | 'dashed';
export type CardTone =
  | 'neutral'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'inverse';
export type CardElement = 'div' | 'section' | 'article' | 'li' | 'aside';
export type CardHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Apply the brand's default inner padding (`--ds-card-padding-*`). */
  pad?: boolean;
  /**
   * Explicit padding: a step, or block/inline spaces. Wins over `pad`. In a
   * sectioned card the header and the body share it, so a title lines up
   * with the content.
   */
  padding?: CardPadding | CardPaddingSpace;
  /** raised (default: border + shadow), flat, sunken or dashed. */
  surface?: CardSurface;
  /** Tinted panel. neutral (default) keeps the surface as is. */
  tone?: CardTone;
  /** Root element; the visual is the same. */
  as?: CardElement;
  /** Add the hover-lift used by clickable cards. */
  interactive?: boolean;
  /** Header title, a heading at `headingLevel` drawn at the h3 size. */
  title?: ReactNode;
  /** Muted line under the title. */
  description?: ReactNode;
  /** Controls at the end of the header row. */
  actions?: ReactNode;
  /** Outline level of the title. Default 3. */
  headingLevel?: CardHeadingLevel;
  /**
   * Render the children in their own body element (the root unpadded, the
   * body padded) even without a header, so the structure does not change
   * when a header comes and goes. A header always implies it.
   */
  sectioned?: boolean;
  children?: ReactNode;
}

const PADDING_CLASS: Record<CardPadding, string> = {
  none: styles.padNone,
  sm: styles.padSm,
  md: styles.padMd,
  lg: styles.padLg,
};

const SURFACE_CLASS: Record<CardSurface, string | undefined> = {
  // raised is the base `.card` look, so legacy skins keep styling it.
  raised: undefined,
  flat: styles.flat,
  sunken: styles.sunken,
  dashed: styles.dashed,
};

const TONE_CLASS: Record<CardTone, string | undefined> = {
  neutral: undefined,
  accent: styles.toneAccent,
  info: styles.toneInfo,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
  inverse: styles.toneInverse,
};

function paddingClass(
  padding: CardPadding | CardPaddingSpace | undefined,
  pad: boolean,
): string | undefined {
  if (padding === undefined) return pad ? styles.pad : undefined;
  if (typeof padding === 'string') return PADDING_CLASS[padding];
  return cx(styles[`pb${padding.block}`], styles[`pi${padding.inline}`]);
}

function isPresent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== '';
}

/**
 * Card — the standard raised surface (border, card radius, soft shadow).
 * `title`, `description` or `actions` add a header row above the content;
 * the card is then sectioned: the root is unpadded, and the header and a body
 * element around the children share the padding step. Otherwise (unless
 * `sectioned`) the children sit directly in the padded root.
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    pad = false,
    padding,
    surface = 'raised',
    tone = 'neutral',
    as: Element = 'div',
    interactive = false,
    title,
    description,
    actions,
    headingLevel = 3,
    sectioned: sectionedProp = false,
    className,
    children,
    ...props
  },
  ref,
) {
  const hasTitle = isPresent(title);
  const hasDescription = isPresent(description);
  const hasActions = isPresent(actions);
  const hasHeader = hasTitle || hasDescription || hasActions;
  const sectioned = hasHeader || sectionedProp;
  const padClass = paddingClass(padding, pad);
  const inverse = tone === 'inverse';

  return (
    <Element
      {...props}
      // A single cast: every allowed tag is an HTMLElement.
      ref={ref as never}
      className={cx(
        styles.card,
        !sectioned && padClass,
        SURFACE_CLASS[surface],
        TONE_CLASS[tone],
        interactive && styles.interactive,
        className,
      )}
    >
      {sectioned ? (
        <>
          {hasHeader && (
            <Inline
              as="div"
              justify="between"
              align="start"
              gap={4}
              className={cx(styles.header, padClass)}
            >
              {/* Always rendered, so actions alone still sit at the end. */}
              <div className={styles.titles}>
                {hasTitle && (
                  <Heading
                    level={headingLevel}
                    size="h3"
                    tone={inverse ? 'inverse' : undefined}
                  >
                    {title}
                  </Heading>
                )}
                {hasDescription && (
                  <Text
                    size="body-sm"
                    tone={inverse ? 'inverse-muted' : 'muted'}
                  >
                    {description}
                  </Text>
                )}
              </div>
              {hasActions && <Inline gap={2}>{actions}</Inline>}
            </Inline>
          )}
          <div className={padClass}>{children}</div>
        </>
      ) : (
        children
      )}
    </Element>
  );
});

Card.displayName = 'Card';
