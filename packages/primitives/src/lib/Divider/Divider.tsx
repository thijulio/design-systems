import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../_util/style';
import styles from './Divider.module.css';

export type DividerProps = HTMLAttributes<HTMLHRElement>;

/** Divider — a thematic break (`<hr>`) drawn as a subtle hairline. */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider(
  { className, ...props },
  ref,
) {
  return <hr ref={ref} {...props} className={cx(styles.divider, className)} />;
});
Divider.displayName = 'Divider';
