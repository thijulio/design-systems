import { h, type VNodeArrayChildren } from 'vue';
import Tok from './Tok.vue';

/**
 * Palette used inside the terminal, as the canonical `--terminal-syntax-*`
 * tokens, so consumers can compose their own syntax-highlighted code lines
 * with <Tok>. (biome-react's export of the same name holds legacy literals;
 * a new package has no consumers of those, ADR-0002.)
 */
export const TERMINAL_COLORS = {
  keyword: 'var(--terminal-syntax-keyword)',
  fn: 'var(--terminal-syntax-fn)',
  string: 'var(--terminal-syntax-string)',
  comment: 'var(--terminal-syntax-comment)',
  punct: 'var(--terminal-syntax-punct)',
  text: 'var(--terminal-syntax-text)',
} as const;

const T = TERMINAL_COLORS;
const OUTPUT = 'var(--terminal-syntax-output)';
const sp = (n: number) => ' '.repeat(n);
const tok = (c: string, text: string) => h(Tok, { c }, () => text);

// Factories, not constants: each hero renders its own VNodes.
export const defaultTitle = (): VNodeArrayChildren => [
  'Your headline goes here,',
  h('br'),
  h('em', 'in two short lines.'),
];

export const defaultLines = (): VNodeArrayChildren => [
  [
    tok(T.keyword, 'const'),
    ' ',
    tok(T.text, 'app'),
    ' ',
    tok(T.punct, '='),
    ' ',
    tok(T.keyword, 'new'),
    ' ',
    tok(T.fn, 'App'),
    tok(T.punct, '();'),
  ],
  ' ',
  [
    tok(T.keyword, 'function'),
    ' ',
    tok(T.fn, 'build'),
    tok(T.punct, '('),
    tok(T.string, 'idea'),
    tok(T.punct, ') {'),
  ],
  [sp(2), tok(T.keyword, 'return'), ' ', tok(T.text, 'app')],
  [
    sp(4),
    tok(T.punct, '.'),
    tok(T.fn, 'plan'),
    tok(T.punct, '('),
    tok(T.string, 'idea'),
    tok(T.punct, ')'),
  ],
  [
    sp(4),
    tok(T.punct, '.'),
    tok(T.fn, 'ship'),
    tok(T.punct, '().'),
    tok(T.fn, 'iterate'),
    tok(T.punct, '();'),
  ],
  [tok(T.punct, '}')],
];

export const defaultCommand = (): VNodeArrayChildren => [
  tok(T.comment, '$'),
  ' build',
  tok(T.punct, '('),
  tok(T.string, "'your project'"),
  tok(T.punct, ')'),
];

export const defaultOutput = (): VNodeArrayChildren => [
  '→ ',
  tok(OUTPUT, '{ status: '),
  tok(T.string, "'ready'"),
  tok(OUTPUT, ', result: '),
  tok(T.string, "'ok'"),
  tok(OUTPUT, ' }'),
];
