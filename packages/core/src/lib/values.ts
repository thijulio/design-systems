/**
 * Cross-platform token-value normalization.
 *
 * The web CSS/JS outputs intentionally keep token values *verbatim* (see
 * AGENTS.md — px stays px, `cubic-bezier`/`clamp` intact, hex case preserved).
 * That is great for CSS, but React Native and Dart cannot consume `clamp()`,
 * `cubic-bezier(...)`, `rem`, `em`, or CSS font stacks directly.
 *
 * This module is **additive** and **pure**: it takes those same resolved
 * string values and classifies them into a normalized, platform-neutral shape
 * that the native-JS and Dart formatters both render. It is the single source
 * of truth for the conversion policy — no per-brand logic, no touching the
 * token JSON.
 *
 * Pure by design: no `style-dictionary` import, so it can be unit-tested in a
 * CJS Jest run (Style Dictionary is ESM-only — see AGENTS.md "Jest + ESM").
 */

/** A CSS `cubic-bezier(...)` easing curve. */
export interface EasingValue {
  kind: 'easing';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** An RGB(A) color. `r`/`g`/`b` are 0–255; `a` is 0–1. */
export interface ColorValue {
  kind: 'color';
  r: number;
  g: number;
  b: number;
  a: number;
}

/** A time value, normalized to milliseconds. */
export interface DurationValue {
  kind: 'duration';
  ms: number;
}

/** A length. `px` is kept as a number; `rem` is converted to px (16px root); `em` keeps its bare coefficient. */
export interface DimensionValue {
  kind: 'dimension';
  value: number;
}

/** A unitless integer (e.g. font weight). */
export interface IntegerValue {
  kind: 'integer';
  value: number;
}

/** A unitless decimal (e.g. line height, letter-spacing coefficient). */
export interface DecimalValue {
  kind: 'decimal';
  value: number;
}

/** A value that has no native equivalent (font stack, shadow, compound radius) — emitted verbatim. */
export interface OpaqueValue {
  kind: 'opaque';
  raw: string;
}

export type Normalized =
  | EasingValue
  | ColorValue
  | DurationValue
  | DimensionValue
  | IntegerValue
  | DecimalValue
  | OpaqueValue;

/** A nested token tree: branches map keys → subtrees, leaves are normalized values. */
export interface TokenTree {
  [key: string]: TokenTree | Normalized;
}

const HEX_RE = /^#([0-9a-fA-F]{3,8})$/;
const RGB_RE =
  /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)$/;
const BEZIER_RE =
  /^cubic-bezier\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)$/;
const CLAMP_RE = /^clamp\(\s*(-?\d*\.?\d+)(px|rem)?\s*,/;
const DURATION_RE = /^(-?\d*\.?\d+)(ms|s)$/;
const PX_RE = /^(-?\d*\.?\d+)px$/;
const REM_RE = /^(-?\d*\.?\d+)rem$/;
const EM_RE = /^(-?\d*\.?\d+)em$/;
const INT_RE = /^-?\d+$/;
const DEC_RE = /^-?\d*\.\d+$/;

/** Round a number to at most 4 decimal places (kills `rem`-conversion drift like 13.5008). */
function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function parseHex(hex: string): ColorValue {
  let h = hex.slice(1);
  if (h.length === 3 || h.length === 4) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length >= 8 ? round4(parseInt(h.slice(6, 8), 16) / 255) : 1;
  return { kind: 'color', r, g, b, a };
}

function parseRgb(m: RegExpExecArray): ColorValue {
  const r = parseInt(m[1], 10);
  const g = parseInt(m[2], 10);
  const b = parseInt(m[3], 10);
  // CSS `rgba()` uses 0–1 for alpha; legacy 0–255 is normalized by dividing.
  const raw = m[4] === undefined ? 1 : parseFloat(m[4]);
  const a = raw > 1 ? round4(raw / 255) : raw;
  return { kind: 'color', r, g, b, a };
}

/**
 * Classify a resolved token string into a normalized value.
 * Order matters: easing and clamp before length, duration before plain number.
 */
export function normalize(raw: unknown): Normalized {
  const v = String(raw).trim();
  let m: RegExpExecArray | null;

  if ((m = BEZIER_RE.exec(v))) {
    return { kind: 'easing', x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4] };
  }
  if ((m = CLAMP_RE.exec(v))) {
    // Fluid web sizes collapse to their minimum (mobile) bound for native.
    return { kind: 'dimension', value: +m[1] };
  }
  if (HEX_RE.test(v)) {
    return parseHex(v);
  }
  if ((m = RGB_RE.exec(v))) {
    return parseRgb(m);
  }
  if ((m = DURATION_RE.exec(v))) {
    const n = +m[1];
    const ms = m[2] === 's' ? Math.round(n * 1000) : Math.round(n);
    return { kind: 'duration', ms };
  }
  if ((m = PX_RE.exec(v))) {
    return { kind: 'dimension', value: +m[1] };
  }
  if ((m = REM_RE.exec(v))) {
    return { kind: 'dimension', value: round4(+m[1] * 16) };
  }
  if ((m = EM_RE.exec(v))) {
    return { kind: 'dimension', value: +m[1] };
  }
  if (INT_RE.test(v)) {
    return { kind: 'integer', value: parseInt(v, 10) };
  }
  if (DEC_RE.test(v)) {
    return { kind: 'decimal', value: +v };
  }
  return { kind: 'opaque', raw: v };
}

/**
 * Flatten a token path into a valid Dart identifier:
 * `['space', '1']` → `space1`, `['accent-50']` → `accent50`,
 * `['bm', 'bone-raised']` → `bmBoneRaised`, `['size', '2xl']` → `size2xl`.
 */
export function dartIdentifier(path: string[]): string {
  const words = path.flatMap((seg) => seg.split('-'));
  return words
    .map((word, i) =>
      i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
}

/** Build a nested token tree from flat, resolved tokens keyed by their `path`. */
export function buildTree(
  tokens: Array<{ path: string[]; value?: unknown }>,
): TokenTree {
  const tree: TokenTree = {};
  for (const token of tokens) {
    let node: TokenTree = tree;
    const segs = token.path;
    for (let i = 0; i < segs.length - 1; i++) {
      const seg = segs[i];
      const existing = node[seg];
      if (
        typeof existing !== 'object' ||
        existing === null ||
        'kind' in (existing as object)
      ) {
        node[seg] = {};
      }
      node = node[seg] as TokenTree;
    }
    node[segs[segs.length - 1]] = normalize(token.value);
  }
  return tree;
}

/** Type guard: is a tree node a branch (subtree) rather than a normalized leaf? */
export function isBranch(value: TokenTree | Normalized): value is TokenTree {
  return typeof value === 'object' && value !== null && !('kind' in value);
}

/** Flatten a tree into `{ id, value }` entries using Dart identifiers. */
export function flattenTree(
  tree: TokenTree,
  path: string[] = [],
): Array<{ id: string; value: Normalized }> {
  const out: Array<{ id: string; value: Normalized }> = [];
  for (const [key, value] of Object.entries(tree)) {
    const nextPath = [...path, key];
    if (isBranch(value)) {
      out.push(...flattenTree(value, nextPath));
    } else {
      out.push({ id: dartIdentifier(nextPath), value });
    }
  }
  return out;
}

/** Format a color component as a two-digit uppercase hex byte. */
export function hexByte(n: number): string {
  return n.toString(16).padStart(2, '0').toUpperCase();
}

/** Format an alpha (0–1) for a CSS `rgba()` literal, trimming trailing zeros. */
export function formatAlpha(a: number): string {
  const s = a.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  return s === '' ? '0' : s;
}

/** Format a Dart `double` literal (always carries a `.`). */
export function dartDouble(n: number): string {
  return Number.isInteger(n) ? `${n}.0` : `${n}`;
}
