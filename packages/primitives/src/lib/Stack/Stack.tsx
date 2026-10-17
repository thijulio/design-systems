import { forwardRef, type ElementType, type HTMLAttributes } from 'react';
import { cx } from '../_util/style';
import { gapClass, type Space } from '../_util/space';
import styles from './Stack.module.css';

export type StackAlign = 'start' | 'center' | 'end' | 'stretch';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Element to render (keeps list/landmark semantics, e.g. `ul`, `section`). */
  as?: ElementType;
  gap?: Space;
  /**
   * Cross-axis alignment. Without it the stack is a block whose children get a
   * top margin (Tailwind `space-y` parity); with it, a flex column with `gap`.
   */
  align?: StackAlign;
}

const ALIGN_CLASS: Record<StackAlign, string> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  stretch: styles.alignStretch,
};

/** Stack — vertical rhythm between children. */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  { as: Component = 'div', gap = 4, align, className, ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      {...props}
      className={cx(
        align ? styles.flex : styles.flow,
        align && ALIGN_CLASS[align],
        gapClass(styles, gap),
        className,
      )}
    />
  );
});
Stack.displayName = 'Stack';
