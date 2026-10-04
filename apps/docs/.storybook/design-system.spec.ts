import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadCsf } from 'storybook/internal/csf-tools';
import { describe, expect, it } from 'vitest';

import {
  type CatalogEntry,
  counterpartEntry,
  designSystemOf,
  isSelection,
  isVisible,
  taxonomyViolation,
} from './design-system.js';

const entry = (
  title: string,
  name: string,
  type: CatalogEntry['type'] = 'story',
): CatalogEntry => ({
  id: `${title}--${name}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
  title,
  name,
  type,
});

describe('designSystemOf', () => {
  it('reads the design system from the first title segment', () => {
    expect(designSystemOf('Exodus/Components/Button')).toBe('Exodus');
    expect(designSystemOf('Faune/Foundations')).toBe('Faune');
  });

  it('returns undefined for unbranded or unknown titles', () => {
    expect(designSystemOf('Introduction')).toBeUndefined();
    expect(designSystemOf('Nocturne/Components/Button')).toBeUndefined();
    expect(designSystemOf('Biomes/Components/Button')).toBeUndefined();
    expect(designSystemOf(undefined)).toBeUndefined();
  });
});

describe('isSelection', () => {
  it('accepts every design system and All', () => {
    for (const value of ['Biome', 'Exodus', 'Faune', 'All']) {
      expect(isSelection(value)).toBe(true);
    }
  });

  it('rejects anything else (e.g. a stale stored value)', () => {
    for (const value of ['biome', 'Nocturne', '', null, undefined, 3]) {
      expect(isSelection(value)).toBe(false);
    }
  });
});

describe('isVisible', () => {
  it('shows only the selected design system', () => {
    expect(isVisible('Exodus/Components/Button', 'Exodus')).toBe(true);
    expect(isVisible('Biome/Components/Button', 'Exodus')).toBe(false);
  });

  it('always shows unbranded pages', () => {
    expect(isVisible('Introduction', 'Faune')).toBe(true);
  });

  it('shows everything for All', () => {
    expect(isVisible('Biome/Foundations', 'All')).toBe(true);
    expect(isVisible('Faune/Components/Tag', 'All')).toBe(true);
  });
});

describe('counterpartEntry', () => {
  const entries = [
    entry('Introduction', 'Docs', 'docs'),
    entry('Biome/Foundations', 'Colors'),
    entry('Biome/Components/Button', 'Docs', 'docs'),
    entry('Biome/Components/Button', 'Primary'),
    entry('Exodus/Foundations', 'Colors'),
    entry('Exodus/Components/Button', 'Docs', 'docs'),
    entry('Exodus/Components/Button', 'Sage'),
    entry('Exodus/Components/Toast', 'Docs', 'docs'),
    entry('Exodus/Migration/Compatibility', 'Sage'),
    entry('Biome/Migration/Compatibility', 'Light'),
    entry('Faune/Foundations', 'Colors'),
    entry('Faune/Foundations', 'Typography'),
    entry('Faune/Components/Button', 'Docs', 'docs'),
    entry('Faune/Components/Button', 'Primary'),
  ];

  it('keeps the same page and story name when the target has it', () => {
    expect(
      counterpartEntry('Biome/Components/Button', 'Primary', 'Faune', entries),
    ).toMatchObject({ title: 'Faune/Components/Button', name: 'Primary' });
  });

  it('keeps the Docs page when switching from a Docs page', () => {
    expect(
      counterpartEntry('Faune/Components/Button', 'Docs', 'Exodus', entries),
    ).toMatchObject({ title: 'Exodus/Components/Button', type: 'docs' });
  });

  it("falls back to the page's Docs entry when the story name is missing", () => {
    expect(
      counterpartEntry('Exodus/Components/Button', 'Sage', 'Biome', entries),
    ).toMatchObject({ title: 'Biome/Components/Button', type: 'docs' });
  });

  it('falls back to the first story when the page has no Docs entry', () => {
    expect(
      counterpartEntry(
        'Exodus/Migration/Compatibility',
        'Sage',
        'Biome',
        entries,
      ),
    ).toMatchObject({ title: 'Biome/Migration/Compatibility', name: 'Light' });
  });

  it('falls back to Foundations when the target lacks the page', () => {
    expect(
      counterpartEntry('Exodus/Components/Toast', 'Docs', 'Faune', entries),
    ).toMatchObject({ title: 'Faune/Foundations', name: 'Colors' });
  });

  it('lands on Foundations when coming from an unbranded page', () => {
    expect(
      counterpartEntry('Introduction', 'Docs', 'Exodus', entries),
    ).toMatchObject({ title: 'Exodus/Foundations' });
  });

  it("falls back to the target's first entry when it has no Foundations", () => {
    const noFoundations = entries.filter(
      (e) => e.title !== 'Faune/Foundations',
    );
    expect(
      counterpartEntry(
        'Exodus/Components/Toast',
        'Docs',
        'Faune',
        noFoundations,
      ),
    ).toMatchObject({ title: 'Faune/Components/Button', type: 'docs' });
  });

  it('returns undefined when the target has no entries at all', () => {
    const biomeOnly = entries.filter((e) => e.title.startsWith('Biome/'));
    expect(
      counterpartEntry('Biome/Foundations', 'Colors', 'Exodus', biomeOnly),
    ).toBeUndefined();
  });
});

describe('taxonomyViolation', () => {
  it.each([
    'Introduction',
    'Biome/Foundations',
    'Exodus/Foundations/Colors',
    'Faune/Components/Button',
    'Faune/Components/tj-button',
    'Biome/Migration/Compatibility',
    'Exodus/Migration/Primitives/Button',
  ])('accepts %s', (title) => {
    expect(taxonomyViolation(title)).toBeUndefined();
  });

  it.each([
    ['Button', /design system/],
    ['Nocturne/Components/Button', /design system/],
    ['Exodus/Core/Button', /section/],
    ['Exodus/Shared/Card', /section/],
    ['Exodus/Components', /component name/],
    ['Exodus/Components/Forms/Input', /flat/],
    ['Exodus/Foundations/Colors/Dark', /Foundations/],
    ['Biome/Migration', /Migration/],
    ['Biome/Components/ Button', /segment/],
    ['Biome//Button', /segment/],
  ])('rejects %s', (title, message) => {
    expect(taxonomyViolation(title)).toMatch(message);
  });
});

// The guard against the sidebar drifting apart again: every sidebar entry in
// this catalog and in the composed Web Components catalog follows one tree.
// Globs mirror the `stories` globs in both apps' .storybook/main.ts.
describe('story titles', () => {
  const docsRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
  );
  const files = [
    'src/**/*.mdx',
    'src/**/*.stories.{js,jsx,ts,tsx}',
    '../docs-web-components/src/**/*.mdx',
    '../docs-web-components/src/**/*.stories.{js,ts}',
  ]
    .flatMap((pattern) => globSync(pattern, { cwd: docsRoot }))
    .sort();

  // An MDX page either names itself (`<Meta title>`) or attaches to a CSF
  // file (`<Meta of>`), whose own title is checked; without either, Storybook
  // would auto-title it from its path, outside the tree.
  const titleOf = (file: string, source: string): string | null => {
    if (!file.endsWith('.mdx')) {
      return (
        loadCsf(source, {
          fileName: file,
          makeTitle: (userTitle?: string) => userTitle ?? '',
        }).parse().meta.title ?? ''
      );
    }
    const title = /<Meta\b[^>]*\btitle=["']([^"']+)["']/.exec(source)?.[1];
    if (title) return title;
    return /<Meta\b[^>]*\bof=\{/.test(source) ? null : '';
  };

  it('finds the story files, MDX pages included', () => {
    expect(files.some((f) => f.endsWith('.mdx'))).toBe(true);
    expect(files.some((f) => f.includes('.stories.'))).toBe(true);
  });

  it.each(files)('%s follows the shared taxonomy', (file) => {
    const title = titleOf(
      file,
      readFileSync(path.join(docsRoot, file), 'utf8'),
    );
    if (title === null) return; // attached to a CSF file, checked there

    expect(title, 'set an explicit title').toBeTruthy();
    expect(taxonomyViolation(title)).toBeUndefined();
  });
});
