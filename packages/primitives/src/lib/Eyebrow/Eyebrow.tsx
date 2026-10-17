import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './Eyebrow.module.css';

export interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  /** Show the leading hairline. */
  line?: boolean;
  children?: ReactNode;
}

/** Eyebrow — small uppercase overline label that leads a section heading. */
export const Eyebrow = forwardRef<HTMLSpanElement, EyebrowProps>(
  function Eyebrow({ line = true, className, children, ...props }, ref) {
    return (
      <span {...props} ref={ref} className={cx(styles.eyebrow, className)}>
        {line && <span className={styles.line} aria-hidden="true" />}
        {children}
      </span>
    );
  },
);

Eyebrow.displayName = 'Eyebrow';
