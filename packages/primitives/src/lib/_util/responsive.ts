/** Breakpoints match the literal media queries in the CSS modules. */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';

/** sm 40rem, md 48rem, lg 64rem, xl 80rem; `base` applies below sm. */
export const BREAKPOINTS: readonly Breakpoint[] = [
  'base',
  'sm',
  'md',
  'lg',
  'xl',
];

/** A single value, or one value per breakpoint (mobile first). */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

function isPerBreakpoint<T>(
  value: Responsive<T>,
): value is Partial<Record<Breakpoint, T>> {
  return typeof value === 'object' && value !== null;
}

/**
 * Turn a responsive value into module class names. `classFor` receives the
 * class prefix (`''` for base, `'sm'`, `'md'`, …) and the value.
 */
export function responsiveClasses<T>(
  value: Responsive<T> | undefined,
  classFor: (
    prefix: '' | Exclude<Breakpoint, 'base'>,
    value: T,
  ) => string | undefined,
): Array<string | undefined> {
  if (value === undefined || value === null) return [];
  if (!isPerBreakpoint(value)) return [classFor('', value as T)];
  return BREAKPOINTS.map((bp) => {
    const v = value[bp];
    if (v === undefined) return undefined;
    return classFor(bp === 'base' ? '' : bp, v);
  });
}
