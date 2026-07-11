import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  /** editorial = tight geometry, flat surface; expressive = soft curve on mata with arcs. */
  variant?: 'editorial' | 'expressive';
  /** Small mono label above the title. */
  kicker?: ReactNode;
  /** Display-font heading. */
  title?: ReactNode;
  children?: ReactNode;
}

/**
 * Card — surface container. `editorial` is the workhorse; `expressive` is the
 * immersive brand surface with decorative contours.
 */
export function Card({
  variant = 'editorial',
  kicker,
  title,
  children,
  className,
  ...rest
}: CardProps) {
  const expressive = variant === 'expressive';
  const cls = [styles.card, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} {...rest}>
      {expressive && (
        <>
          <span className={`${styles.arc} ${styles.arc1}`} aria-hidden="true" />
          <span className={`${styles.arc} ${styles.arc2}`} aria-hidden="true" />
        </>
      )}
      <div className={styles.inner}>
        {kicker && <div className={styles.kicker}>{kicker}</div>}
        {title && (
          <div
            className={[styles.title, children && styles.titleGap]
              .filter(Boolean)
              .join(' ')}
          >
            {title}
          </div>
        )}
        {children && <div className={styles.body}>{children}</div>}
      </div>
    </div>
  );
}
