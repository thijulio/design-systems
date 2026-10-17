import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './DescriptionList.module.css';

export interface DescriptionListItem {
  term: ReactNode;
  description: ReactNode;
  /** `data-testid` for the term/description group. */
  testId?: string;
}

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  items: ReadonlyArray<DescriptionListItem>;
  /** `stacked`: term above description. `inline`: term and description side by side. */
  layout?: 'stacked' | 'inline';
}

/** DescriptionList — term/description pairs on a `<dl>`. */
export const DescriptionList = forwardRef<
  HTMLDListElement,
  DescriptionListProps
>(function DescriptionList(
  { items, layout = 'stacked', className, ...props },
  ref,
) {
  return (
    <dl
      ref={ref}
      {...props}
      className={cx(
        styles.list,
        layout === 'inline' ? styles.inline : styles.stacked,
        className,
      )}
    >
      {items.map((item, index) => (
        <div key={index} className={styles.item} data-testid={item.testId}>
          <dt className={styles.term}>{item.term}</dt>
          <dd className={styles.description}>{item.description}</dd>
        </div>
      ))}
    </dl>
  );
});
DescriptionList.displayName = 'DescriptionList';
