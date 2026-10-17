/** The contract spacing scale. `N` resolves to `var(--ds-space-N)`; 0 is `0`. */
export type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

/**
 * Class name for a gap in a component's CSS module. Every layout module
 * declares `.g0` … `.g16`, so the class lookup stays a plain string join.
 */
export function gapClass(
  styles: Readonly<Record<string, string>>,
  gap: Space,
): string | undefined {
  return styles[`g${gap}`];
}
