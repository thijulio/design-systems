import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../_util/style';
import styles from './Code.module.css';

export type CodeSize = 'inherit' | 'caption' | 'body-sm' | 'body';

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  /**
   * Render a block, `<pre><code>`, that keeps line breaks and wraps long
   * lines. Default: inline `<code>`. Either way the ref, `className` and
   * every other prop land on the `<code>`.
   */
  block?: boolean;
  /** Type size; `inherit` (default) follows the surrounding text. */
  size?: CodeSize;
}

const SIZE_CLASS: Record<CodeSize, string | undefined> = {
  inherit: undefined,
  caption: styles.caption,
  'body-sm': styles.bodySm,
  body: styles.body,
};

/**
 * Code — code, keys and one-time secrets in the brand's mono face
 * (`--ds-font-mono`) on a sunken surface. Long unspaced strings wrap
 * anywhere, so a key never overflows a narrow screen.
 */
export const Code = forwardRef<HTMLElement, CodeProps>(function Code(
  { block = false, size = 'inherit', className, ...props },
  ref,
) {
  const code = (
    <code
      ref={ref}
      {...props}
      className={cx(
        styles.code,
        block ? styles.block : styles.inline,
        SIZE_CLASS[size],
        className,
      )}
    />
  );
  return block ? <pre className={styles.pre}>{code}</pre> : code;
});
Code.displayName = 'Code';
