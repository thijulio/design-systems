import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../_util/style';
import { Heading } from '../Heading/Heading';
import { Text } from '../Text/Text';
import styles from './PageHeader.module.css';

export interface PageHeaderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Page-level controls aligned to the end. */
  actions?: ReactNode;
  /** Extra content under the subtitle. */
  children?: ReactNode;
  headingLevel?: 1 | 2;
}

/**
 * PageHeader — the page title row. The root is a `div` (not `<header>`) so it
 * never becomes a banner landmark or matches `header …` selectors.
 */
export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  function PageHeader(
    {
      title,
      subtitle,
      actions,
      children,
      headingLevel = 1,
      className,
      ...props
    },
    ref,
  ) {
    const hasSubtitle =
      subtitle !== undefined && subtitle !== null && subtitle !== '';
    return (
      <div ref={ref} {...props} className={cx(styles.pageHeader, className)}>
        <div className={styles.titles}>
          <Heading
            level={headingLevel}
            size={headingLevel === 1 ? 'h1' : 'h2'}
            tracking="tight"
          >
            {title}
          </Heading>
          {hasSubtitle && (
            <Text size="body" tone="muted">
              {subtitle}
            </Text>
          )}
          {children}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    );
  },
);
PageHeader.displayName = 'PageHeader';
