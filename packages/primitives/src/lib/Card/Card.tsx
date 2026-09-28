import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../_util/style';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Apply the default inner padding. */
  pad?: boolean;
  /** Add the hover-lift used by clickable cards. */
  interactive?: boolean;
  children?: ReactNode;
}

/** Card — the standard raised surface (border, card radius, soft shadow). */
export function Card({
  pad = false,
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cx(
        styles.card,
        pad && styles.pad,
        interactive && styles.interactive,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
