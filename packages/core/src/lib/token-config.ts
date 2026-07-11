import type { Config } from 'style-dictionary/types';

/** Style Dictionary's config object type (type-only import — erased at runtime). */
export type StyleDictionaryConfig = Config;

export interface BuildBrandTokensOptions {
  /** Directory containing the brand's Style Dictionary token JSON (globbed recursively). */
  source: string;
  /** Directory where generated artifacts (tokens.css, tokens.js, tokens.d.ts) are written. */
  buildPath: string;
  /**
   * CSS custom-property prefix, e.g. `bm` → `--bm-color-...`.
   * Applied to the CSS platform only — JS/TS token names stay prefix-free.
   */
  prefix?: string;
}

/**
 * The shared token build config every brand extends. Pure — returns config only, runs nothing —
 * so it can be unit-tested without importing (ESM-only) Style Dictionary at runtime.
 *
 * One JSON source → two outputs:
 *  - `tokens.css`  CSS custom properties (references preserved as `var(--…)`)
 *  - `tokens.js` / `tokens.d.ts`  typed JS/TS objects (the React Native drop-in path)
 */
export function createTokenConfig(
  options: BuildBrandTokensOptions,
): StyleDictionaryConfig {
  const { source, buildPath, prefix } = options;
  const out = buildPath.endsWith('/') ? buildPath : `${buildPath}/`;
  const src = source.replace(/\/+$/, '');

  return {
    source: [`${src}/**/*.json`],
    platforms: {
      css: {
        transformGroup: 'css',
        prefix,
        buildPath: out,
        files: [
          {
            destination: 'tokens.css',
            format: 'css/variables',
            options: { outputReferences: true },
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
