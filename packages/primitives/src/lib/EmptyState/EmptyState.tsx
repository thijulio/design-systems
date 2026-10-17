import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './EmptyState.module.css';

export type EmptyStateHeadingLevel = 2 | 3 | 4 | 5 | 6;
/** `md` is a roomy panel; `sm` is compact, for a list or form section. */
export type EmptyStateSize = 'md' | 'sm';
/** `dashed` draws the panel; `none` sits inline in the flow, unpadded. */
export type EmptyStateSurface = 'dashed' | 'none';
export type EmptyStateAlign = 'center' | 'start';

export interface EmptyStateProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  /** Icon rendered in the accent tile (decorative). */
  icon?: ReactNode;
  /** Headline. Omit it for a message-only empty state. */
  title?: ReactNode;
  /** Heading element for the title, to fit the page outline. Default 3. */
  headingLevel?: EmptyStateHeadingLevel;
  /** Supporting copy; a `div`, so it may hold paragraphs or lists. */
  children?: ReactNode;
  /** Optional action slot (e.g. a Button). */
  action?: ReactNode;
  /** Default `md`. */
  size?: EmptyStateSize;
  /** Default `dashed`. */
  surface?: EmptyStateSurface;
  /** Default `center`. */
  align?: EmptyStateAlign;
}

const SIZE_CLASS: Record<EmptyStateSize, string> = {
  md: styles.md,
  sm: styles.sm,
};

const SURFACE_CLASS: Record<EmptyStateSurface, string> = {
  dashed: styles.dashed,
  none: styles.plain,
};

const ALIGN_CLASS: Record<EmptyStateAlign, string> = {
  center: styles.center,
  start: styles.start,
};

/**
 * EmptyState — "nothing here yet": an optional icon tile and title, the
 * copy and an action, on a dashed panel or inline in the flow.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(
    {
      icon,
      title,
      headingLevel = 3,
      children,
      action,
      size = 'md',
      surface = 'dashed',
      align = 'center',
      className,
      ...props
    },
    ref,
  ) {
    const Heading = `h${headingLevel}` as const;
    return (
      <div
        {...props}
        ref={ref}
        className={cx(
          styles.root,
          SIZE_CLASS[size],
          SURFACE_CLASS[surface],
          ALIGN_CLASS[align],
          className,
        )}
      >
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        {title && <Heading className={styles.title}>{title}</Heading>}
        {children && <div className={styles.body}>{children}</div>}
        {action && <div className={styles.action}>{action}</div>}
      </div>
    );
  },
);

EmptyState.displayName = 'EmptyState';
