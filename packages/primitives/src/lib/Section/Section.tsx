import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../_util/style';
import type { Space } from '../_util/space';
import { Heading } from '../Heading/Heading';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
import styles from './Section.module.css';

/**
 * `wash` is a full-bleed page band (a soft vertical gradient, no frame);
 * `accent` a framed lead panel (hero) outlined in the soft accent.
 */
export type SectionSurface = 'plain' | 'raised' | 'sunken' | 'wash' | 'accent';
export type SectionPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface SectionProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  /** Element to render; defaults to `section`. */
  as?: ElementType;
  title?: ReactNode;
  description?: ReactNode;
  /** Controls aligned to the end of the header row. */
  actions?: ReactNode;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  surface?: SectionSurface;
  /**
   * Inner padding. Defaults to `none` on the plain and wash surfaces, `md`
   * otherwise.
   */
  padding?: SectionPadding;
  /** Vertical gap between the header and each child. */
  gap?: Space;
}

const SURFACE_CLASS: Record<SectionSurface, string> = {
  plain: styles.plain,
  raised: styles.raised,
  sunken: styles.sunken,
  wash: styles.wash,
  accent: styles.accent,
};

const PADDING_CLASS: Record<SectionPadding, string | undefined> = {
  none: undefined,
  sm: styles.padSm,
  md: styles.padMd,
  lg: styles.padLg,
  xl: styles.padXl,
};

/** Section — a titled block of a page: header row, then stacked content. */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  {
    as = 'section',
    title,
    description,
    actions,
    headingLevel = 2,
    surface = 'plain',
    padding,
    gap = 4,
    className,
    children,
    ...props
  },
  ref,
) {
  const hasTitle = title !== undefined && title !== null && title !== '';
  const hasDescription =
    description !== undefined && description !== null && description !== '';
  const resolvedPadding =
    padding ?? (surface === 'plain' || surface === 'wash' ? 'none' : 'md');
  return (
    <Stack
      ref={ref}
      as={as}
      gap={gap}
      {...props}
      className={cx(
        styles.section,
        SURFACE_CLASS[surface],
        PADDING_CLASS[resolvedPadding],
        className,
      )}
    >
      {(hasTitle || hasDescription || actions) && (
        <div className={styles.header}>
          {(hasTitle || hasDescription) && (
            <div className={styles.titles}>
              {hasTitle && (
                <Heading level={headingLevel} size="lead">
                  {title}
                </Heading>
              )}
              {hasDescription && (
                <Text size="body-sm" tone="muted">
                  {description}
                </Text>
              )}
            </div>
          )}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      {children}
    </Stack>
  );
});
Section.displayName = 'Section';
