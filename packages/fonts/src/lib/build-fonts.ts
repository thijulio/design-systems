import { copyFile, mkdir, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import {
  licenseFileName,
  planFontFaces,
  renderFontFaces,
  type BrandFonts,
  type FontSubset,
} from './font-faces.js';

export interface FontsourceResolver {
  /** Absolute path of `<pkg>/<subpath>` as installed for the brand package. */
  file(pkg: string, subpath: string): string;
  /** The subset's unicode-range, from the package's own `unicode.json`. */
  unicodeRange(pkg: string, subset: FontSubset): string;
}

/**
 * Resolve fontsource packages from the brand css package (where they are
 * pinned as devDependencies), not from @thijulio/fonts.
 */
export async function createFontsourceResolver(
  packageRoot: string,
  fonts: BrandFonts,
): Promise<FontsourceResolver> {
  const require = createRequire(join(packageRoot, 'package.json'));
  const file = (pkg: string, subpath: string) =>
    require.resolve(`${pkg}/${subpath}`);

  const ranges = new Map<string, Record<string, string>>();
  for (const pkg of new Set(fonts.map((f) => f.source.package)))
    ranges.set(
      pkg,
      JSON.parse(await readFile(file(pkg, 'unicode.json'), 'utf-8')),
    );

  return {
    file,
    unicodeRange(pkg, subset) {
      const range = ranges.get(pkg)?.[subset];
      if (!range) throw new Error(`${pkg} has no ${subset} subset`);
      return range;
    },
  };
}

export interface BuildFontsOptions {
  /** The brand css package root (resolves its fontsource devDependencies). */
  packageRoot: string;
  /** Output root; files land in `<outDir>/fonts/`. */
  outDir: string;
  fonts: BrandFonts;
}

/**
 * Copy the brand's woff2 files (latin + latin-ext) and each package's SIL OFL
 * licence into `<outDir>/fonts/`, and return the `@font-face` CSS that
 * references them by relative url — to be placed first in the bundle, which
 * must live in `outDir`.
 */
export async function buildFonts({
  packageRoot,
  outDir,
  fonts,
}: BuildFontsOptions): Promise<string> {
  const resolver = await createFontsourceResolver(packageRoot, fonts);
  const faces = planFontFaces(fonts, resolver.unicodeRange);

  const fontsDir = join(outDir, 'fonts');
  await rm(fontsDir, { recursive: true, force: true });
  await mkdir(fontsDir, { recursive: true });

  const copies = new Map<string, string>(); // dest basename → source path
  for (const face of faces)
    copies.set(face.file, resolver.file(face.package, `files/${face.file}`));
  // OFL 1.1 requires the licence to travel with the font files.
  for (const pkg of new Set(faces.map((f) => f.package)))
    copies.set(licenseFileName(pkg), resolver.file(pkg, 'LICENSE'));

  await Promise.all(
    [...copies].map(([dest, src]) => copyFile(src, join(fontsDir, dest))),
  );

  return renderFontFaces(faces);
}
