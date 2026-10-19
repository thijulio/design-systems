import { copyFile, mkdir, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import {
  fallbackOverrides,
  licenseFileName,
  planFallbackFaces,
  planFontFaces,
  renderFontFaces,
  type BrandFonts,
  type FontDisplay,
  type FontMetrics,
  type FontStyle,
  type FontSubset,
  type ResolvedFallbackFace,
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

/** Where fallback metrics come from; tests inject fixed numbers. */
export interface FontMetricsLoader {
  /** Metrics of a shipped woff2 file (absolute path). */
  webfont(path: string): Promise<FontMetrics>;
  /** Metrics of a system font: an `@capsizecss/metrics` module, e.g. `arial/regular`. */
  system(metrics: string): Promise<FontMetrics>;
}

/** What capsize reports: the font's own average, and per subset. */
interface CapsizeMetrics extends FontMetrics {
  subsets?: { latin?: { xWidthAvg: number } };
}

const toFontMetrics = (m: CapsizeMetrics): FontMetrics => ({
  ascent: m.ascent,
  descent: m.descent,
  lineGap: m.lineGap,
  unitsPerEm: m.unitsPerEm,
  xWidthAvg: m.subsets?.latin?.xWidthAvg ?? m.xWidthAvg,
});

/**
 * Capsize: the webfont measured from the file we ship (`@capsizecss/unpack`),
 * the system font from capsize's measured catalogue (`@capsizecss/metrics`) —
 * it isn't installed where the build runs.
 */
export const capsizeMetrics: FontMetricsLoader = {
  async webfont(path) {
    const { fromFile } = await import('@capsizecss/unpack/fs');
    return toFontMetrics(await fromFile(path));
  },
  async system(metrics) {
    const module = (await import(`@capsizecss/metrics/${metrics}`)) as {
      default: CapsizeMetrics;
    };
    return toFontMetrics(module.default);
  },
};

/** Plan the brand's fallback faces and compute their overrides. */
export async function resolveFallbackFaces(
  fonts: BrandFonts,
  resolver: FontsourceResolver,
  loader: FontMetricsLoader = capsizeMetrics,
): Promise<ResolvedFallbackFace[]> {
  return Promise.all(
    planFallbackFaces(fonts).map(async (face) => ({
      ...face,
      ...fallbackOverrides(
        await loader.webfont(
          resolver.file(face.webfont.package, `files/${face.webfont.file}`),
        ),
        await loader.system(face.metrics),
      ),
    })),
  );
}

/** One family × style: the scope of a per-face stylesheet. */
export interface FaceScope {
  family: string;
  style: FontStyle;
}

/** Whether a webfont or fallback face is in scope (every face, without one). */
export const inScope =
  (scope: FaceScope | undefined) =>
  (face: { family: string; style: FontStyle }) =>
    !scope ||
    (face.style === scope.style &&
      (face.family === scope.family ||
        face.family.startsWith(`${scope.family} Fallback `)));

async function planBrandFonts(
  packageRoot: string,
  fonts: BrandFonts,
  loader?: FontMetricsLoader,
  scope?: FaceScope,
) {
  const resolver = await createFontsourceResolver(packageRoot, fonts);
  return {
    resolver,
    faces: planFontFaces(fonts, resolver.unicodeRange).filter(inScope(scope)),
    fallbacks: (await resolveFallbackFaces(fonts, resolver, loader)).filter(
      inScope(scope),
    ),
  };
}

export interface BuildFontsOptions {
  /** The brand css package root (resolves its fontsource devDependencies). */
  packageRoot: string;
  /** Output root; files land in `<outDir>/fonts/`. */
  outDir: string;
  fonts: BrandFonts;
  /** Defaults to capsize. */
  metrics?: FontMetricsLoader;
}

/**
 * Copy the brand's woff2 files (latin + latin-ext) and each package's SIL OFL
 * licence into `<outDir>/fonts/`, and return the `@font-face` CSS that
 * references them by relative url (`font-display: swap`), followed by the
 * metric-matched fallback faces — to be placed first in the bundle, which must
 * live in `outDir`.
 */
export async function buildFonts({
  packageRoot,
  outDir,
  fonts,
  metrics,
}: BuildFontsOptions): Promise<string> {
  const { resolver, faces, fallbacks } = await planBrandFonts(
    packageRoot,
    fonts,
    metrics,
  );

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

  return renderFontFaces(faces, { fallbacks });
}

export interface FontFacesCssOptions {
  /** The brand css package root (resolves its fontsource devDependencies). */
  packageRoot: string;
  fonts: BrandFonts;
  display: FontDisplay;
  /** Only this family × style (its webfont and fallback faces). */
  only?: FaceScope;
  /** Directory the `src` urls are relative to. Defaults to `./fonts`. */
  fontsDir?: string;
  /** Defaults to capsize. */
  metrics?: FontMetricsLoader;
}

/**
 * The same `@font-face` rules `buildFonts` returns, with another
 * `font-display`, optionally for one family × style — for another stylesheet
 * next to the bundle (or in a folder below it, with `fontsDir`). Copies
 * nothing: the files are the ones `buildFonts` shipped.
 */
export async function fontFacesCss({
  packageRoot,
  fonts,
  display,
  only,
  fontsDir,
  metrics,
}: FontFacesCssOptions): Promise<string> {
  const { faces, fallbacks } = await planBrandFonts(
    packageRoot,
    fonts,
    metrics,
    only,
  );
  if (only && faces.length === 0)
    throw new Error(`${only.family} ${only.style}: not in the font contract`);
  return renderFontFaces(faces, { display, fontsDir, fallbacks });
}
