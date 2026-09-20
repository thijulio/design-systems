import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './Eyebrow.module.css';

export interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  /** Show the leading hairline. */
  line?: boolean;
  children?: ReactNode;
}

/** Eyebrow — small uppercase overline label that leads a section heading. */
export function Eyebrow({
  line = true,
  className,
  children,
  ...props
}: EyebrowProps) {
  return (
    <span className={cx(styles.eyebrow, className)} {...props}>
      {line && <span className={styles.line} aria-hidden="true" />}
      {children}
    </span>
  );
}
