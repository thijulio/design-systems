import { resolve } from 'node:path';
import type { Config } from 'style-dictionary/types';

/** Style Dictionary's config object type (type-only import — erased at runtime). */
export type StyleDictionaryConfig = Config;

/** A selector-scoped set of token overrides layered on top of the base `:root` block. */
export interface ThemeOverlay {
  /** CSS selector the overlay's variables are scoped to, e.g. `[data-mode="dark"]`. */
  selector: string;
  /** Directory of token JSON that overrides base semantics for this theme. */
  source: string;
}

export interface BuildBrandTokensOptions {
  /** Directory containing the brand's base token JSON (globbed recursively). */
  source: string;
  /** Directory where generated artifacts (tokens.css, tokens.js, tokens.d.ts) are written. */
  buildPath: string;
  /**
   * CSS custom-property prefix, e.g. `bm` → `--bm-color-...`.
   * Applied to the CSS platform only — JS/TS token names stay prefix-free.
   * Most brands leave this unset and encode any namespace in the token paths.
   */
  prefix?: string;
  /** Optional theme overlays appended, in order, after the base `:root` block. */
  themes?: ThemeOverlay[];
}

const glob = (dir: string): string => `${dir.replace(/\/+$/, '')}/**/*.json`;
const withSlash = (p: string): string => (p.endsWith('/') ? p : `${p}/`);

/** Temp filename an overlay is built to before being concatenated into tokens.css. */
export const themeTempFile = (index: number): string => `__theme-${index}.css`;

/**
 * Base build config: the `:root` block plus the typed JS/TS objects.
 * Pure — returns config only — so it can be unit-tested without importing
 * (ESM-only) Style Dictionary at runtime.
 *
 * One JSON source → `tokens.css` (`:root`, references preserved as `var(--…)`)
 * plus `tokens.js` / `tokens.d.ts` (the React Native drop-in path).
 */
export function createBaseConfig(
  options: BuildBrandTokensOptions,
): StyleDictionaryConfig {
  const { source, buildPath, prefix } = options;
  const out = withSlash(buildPath);

  return {
    source: [glob(source)],
    platforms: {
      css: {
        transformGroup: 'css',
        prefix,
        buildPath: out,
        files: [
          {
            destination: 'tokens.css',
            format: 'css/variables',
            options: { selector: ':root', outputReferences: true },
          },
        ],
      },
      ts: {
        transformGroup: 'js',
        buildPath: out,
        files: [
          { destination: 'tokens.js', format: 'javascript/es6' },
          { destination: 'tokens.d.ts', format: 'typescript/es6-declarations' },
        ],
      },
    },
  };
}

/**
 * Overlay build config for a single theme. Includes the base sources so `var(--…)`
 * references resolve, but emits **only** the overlay's own tokens, scoped to its selector.
 * Collisions with base (the whole point of an overlay) are silenced.
 */
export function createThemeConfig(
  options: BuildBrandTokensOptions,
  theme: ThemeOverlay,
  index: number,
): StyleDictionaryConfig {
  const { source, buildPath, prefix } = options;
  const out = withSlash(buildPath);
  const themeDir = resolve(theme.source);

  return {
    source: [glob(source), glob(theme.source)],
    log: { warnings: 'disabled' },
    platforms: {
      css: {
        transformGroup: 'css',
        prefix,
        buildPath: out,
        files: [
          {
            destination: themeTempFile(index),
            format: 'css/variables',
            options: { selector: theme.selector, outputReferences: true },
            // Emit only tokens that came from this overlay's directory.
            filter: (token) => resolve(token.filePath).startsWith(themeDir),
          },
        ],
      },
    },
  };
}
