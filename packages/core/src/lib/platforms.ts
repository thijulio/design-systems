/**
 * Registers the cross-platform Style Dictionary formats (native JS/DTS and
 * Dart) exactly once per process. Called by the SD runner (`build-tokens.ts`);
 * the pure config factories in `token-config.ts` reference these formats by
 * name string only, so they stay free of any runtime Style Dictionary import.
 */
import StyleDictionary from 'style-dictionary';
import { nativeFormats } from './formats/native.js';
import { dartFormats } from './formats/dart.js';

let registered = false;

export function registerPlatforms(): void {
  if (registered) {
    return;
  }
  for (const format of [...nativeFormats, ...dartFormats]) {
    StyleDictionary.registerFormat(format);
  }
  registered = true;
}
