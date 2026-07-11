import type { CSSProperties, ReactNode } from 'react';
import { cx, type StyleWithVars } from '../_util/style';
import styles from './BrandMark.module.css';

const DIMS = { sm: 30, md: 34, lg: 40 } as const;
const FONTS = { sm: 16, md: 18, lg: 22 } as const;

export interface BrandMarkProps {
  /** Product name / wordmark text. */
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  /** `baloo` uses the reserved wordmark face (var(--font-wordmark)). */
  wordmarkFont?: 'sans' | 'baloo';
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * BrandMark — accent shield-check mark + wordmark. The mark reskins per theme;
 * Baloo 2 is used for the wordmark only when `wordmarkFont="baloo"` (or name "PMP").
 */
export function BrandMark({
  name = 'Companion',
  size = 'md',
  wordmarkFont,
  onClick,
  className,
  style,
}: BrandMarkProps) {
  const dim = DIMS[size];
  const useBaloo = wordmarkFont === 'baloo' || name === 'PMP';
  const vars: StyleWithVars = {
    '--bm-dim': `${dim}px`,
    '--bm-font': `${FONTS[size]}px`,
    '--bm-family': useBaloo ? 'var(--font-wordmark)' : 'var(--font-sans)',
    ...style,
  };

  const content: ReactNode = (
    <>
      <span className={styles.mark}>
        <svg
          width={dim * 0.56}
          height={dim * 0.56}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </span>
      <span className={styles.name}>{name}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cx(styles.brand, styles.button, className)}
        style={vars}
      >
        {content}
      </button>
    );
  }
  return (
    <span className={cx(styles.brand, className)} style={vars}>
      {content}
    </span>
  );
}
