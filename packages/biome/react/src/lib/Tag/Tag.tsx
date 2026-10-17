import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Tag as PrimitiveTag } from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';
import styles from './Tag.module.css';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** outline (default), solid emphasis, or muted mono. */
  variant?: 'outline' | 'solid' | 'muted';
  /** Show a pulsing status dot before the label. */
  status?: boolean;
  children?: ReactNode;
}

/**
 * Tag — pill label for skills, categories and status.
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { variant = 'outline', status = false, children, className, ...rest },
  ref,
) {
  const cls = [styles.tag, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <PrimitiveTag
      ref={ref}
      variant={variant}
      status={status}
      className={cls}
      {...rest}
    >
      {children}
    </PrimitiveTag>
  );
});

Tag.displayName = 'Tag';
