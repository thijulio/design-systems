import { readFile, appendFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import StyleDictionary from 'style-dictionary';
import {
  createBaseConfig,
  createThemeConfig,
  themeTempFile,
  type BuildBrandTokensOptions,
} from './token-config.js';

/** Remove Style Dictionary's leading "Do not edit" header so it appears once per file. */
const stripHeader = (css: string): string =>
  css.replace(/^\/\*\*[\s\S]*?\*\/\s*/, '');

/**
 * Build a brand's tokens to disk using the shared config:
 *  - `tokens.css`  the `:root` base block, followed by one block per theme overlay
 *  - `tokens.js` / `tokens.d.ts`  typed objects (base values)
 */
export async function buildBrandTokens(
  options: BuildBrandTokensOptions,
): Promise<void> {
  const { buildPath, themes = [] } = options;

  // 1. Base: writes tokens.css (:root) + tokens.js + tokens.d.ts.
  await new StyleDictionary(createBaseConfig(options)).buildAllPlatforms();

  // 2. Each theme overlay → its own file, then appended (header-stripped) to tokens.css.
  const tokensCss = join(buildPath, 'tokens.css');
  for (let i = 0; i < themes.length; i++) {
    await new StyleDictionary(
      createThemeConfig(options, themes[i], i),
    ).buildAllPlatforms();

    const tempPath = join(buildPath, themeTempFile(i));
    const overlay = stripHeader(await readFile(tempPath, 'utf-8'));
    await appendFile(tokensCss, `\n${overlay}`);
    await rm(tempPath);
  }
}
