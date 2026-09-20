import { buildTree, dartIdentifier, flattenTree, normalize } from './values.js';

describe('normalize', () => {
  it('parses easing curves into x/y control points', () => {
    expect(normalize('cubic-bezier(0.2, 0.7, 0.2, 1)')).toEqual({
      kind: 'easing',
      x1: 0.2,
      y1: 0.7,
      x2: 0.2,
      y2: 1,
    });
  });

  it('parses hex and rgba colors, preserving alpha', () => {
    expect(normalize('#3F5237')).toEqual({
      kind: 'color',
      r: 0x3f,
      g: 0x52,
      b: 0x37,
      a: 1,
    });
    expect(normalize('rgba(35, 42, 32, 0.12)')).toEqual({
      kind: 'color',
      r: 35,
      g: 42,
      b: 32,
      a: 0.12,
    });
  });

  it('normalizes durations to milliseconds', () => {
    expect(normalize('0.25s')).toEqual({ kind: 'duration', ms: 250 });
    expect(normalize('9s')).toEqual({ kind: 'duration', ms: 9000 });
    expect(normalize('300ms')).toEqual({ kind: 'duration', ms: 300 });
  });

  it('normalizes px, rem (16px root) and em (bare coefficient)', () => {
    expect(normalize('12px')).toEqual({ kind: 'dimension', value: 12 });
    expect(normalize('0.75rem')).toEqual({ kind: 'dimension', value: 12 });
    expect(normalize('0.8438rem')).toEqual({
      kind: 'dimension',
      value: 13.5008,
    });
    expect(normalize('-0.02em')).toEqual({ kind: 'dimension', value: -0.02 });
  });

  it('collapses fluid clamp() to its mobile (min) bound', () => {
    expect(normalize('clamp(52px, 10vw, 150px)')).toEqual({
      kind: 'dimension',
      value: 52,
    });
  });

  it('keeps unitless integers and decimals distinct', () => {
    expect(normalize('700')).toEqual({ kind: 'integer', value: 700 });
    expect(normalize('1.5')).toEqual({ kind: 'decimal', value: 1.5 });
  });

  it('passes web-only values through as opaque strings', () => {
    expect(normalize("'Newsreader', Georgia, serif")).toEqual({
      kind: 'opaque',
      raw: "'Newsreader', Georgia, serif",
    });
    expect(normalize('24px 24px 24px 4px')).toEqual({
      kind: 'opaque',
      raw: '24px 24px 24px 4px',
    });
  });
});

describe('dartIdentifier', () => {
  it('flattens paths to camelCase identifiers safe for Dart', () => {
    expect(dartIdentifier(['space', '1'])).toBe('space1');
    expect(dartIdentifier(['accent-50'])).toBe('accent50');
    expect(dartIdentifier(['bm', 'bone-raised'])).toBe('bmBoneRaised');
    expect(dartIdentifier(['size', '2xl'])).toBe('size2xl');
    expect(dartIdentifier(['tone', 'neutral', 'soft'])).toBe('toneNeutralSoft');
  });
});

describe('buildTree / flattenTree', () => {
  const tree = buildTree([
    { path: ['space', '1'], value: '4px' },
    { path: ['accent-50'], value: '#f2f7f2' },
    { path: ['ease', 'in-out'], value: 'cubic-bezier(0.65, 0, 0.35, 1)' },
  ]);

  it('nests by path and keeps original keys', () => {
    expect(tree['space']).toBeDefined();
    expect(tree['accent-50']).toEqual({
      kind: 'color',
      r: 0xf2,
      g: 0xf7,
      b: 0xf2,
      a: 1,
    });
  });

  it('flattens leaves back to Dart identifiers', () => {
    const flat = flattenTree(tree);
    expect(flat.map((f) => f.id).sort()).toEqual([
      'accent50',
      'easeInOut',
      'space1',
    ]);
  });
});
