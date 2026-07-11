import StyleDictionary from 'style-dictionary';
import {
  createTokenConfig,
  type BuildBrandTokensOptions,
} from './token-config.js';

/** Build a brand's tokens to disk (tokens.css + tokens.js + tokens.d.ts) using the shared config. */
export async function buildBrandTokens(
  options: BuildBrandTokensOptions,
): Promise<void> {
  const sd = new StyleDictionary(createTokenConfig(options));
  await sd.buildAllPlatforms();
}
