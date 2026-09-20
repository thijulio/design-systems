import type { CSSProperties } from 'react';

/** Join class names, dropping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** CSSProperties that also permits `--custom` properties (for data-driven token wiring). */
export type StyleWithVars = CSSProperties &
  Record<`--${string}`, string | number>;
