import { useEffect, useRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import styles from './TerminalHero.module.css';

/**
 * Palette used inside the terminal. Exposed so consumers can compose their own
 * syntax-highlighted code lines with <Tok>.
 */
export const TERMINAL_COLORS = {
  keyword: '#8FB089', // sage
  fn: '#C8693B', // terracotta
  string: '#E8A627', // ipê
  comment: '#6E8C7A',
  punct: '#7E8C7A',
  text: '#ECEFE3',
} as const;

export interface TokProps {
  /** Token colour — usually one of TERMINAL_COLORS. */
  c: string;
  children?: ReactNode;
}

/** A syntax token for building code lines. */
export function Tok({ c, children }: TokProps) {
  return <span style={{ color: c }}>{children}</span>;
}

const sp = (n: number) => ' '.repeat(n);
const T = TERMINAL_COLORS;

const DEFAULT_TITLE = (
  <>
    I grow software
    <br />
    <em style={{ fontStyle: 'italic', color: '#8FB089' }}>like ecosystems.</em>
  </>
);

const DEFAULT_LINES: ReactNode[] = [
  <>
    <Tok c={T.keyword}>const</Tok> <Tok c={T.text}>biome</Tok>{' '}
    <Tok c={T.punct}>=</Tok> <Tok c={T.keyword}>new</Tok>{' '}
    <Tok c={T.fn}>Ecosystem</Tok>
    <Tok c={T.punct}>();</Tok>
  </>,
  <>{' '}</>,
  <>
    <Tok c={T.keyword}>function</Tok> <Tok c={T.fn}>thiago</Tok>
    <Tok c={T.punct}>(</Tok>
    <Tok c={T.string}>challenge</Tok>
    <Tok c={T.punct}>) {'{'}</Tok>
  </>,
  <>
    {sp(2)}
    <Tok c={T.keyword}>return</Tok> <Tok c={T.text}>biome</Tok>
  </>,
  <>
    {sp(4)}
    <Tok c={T.punct}>.</Tok>
    <Tok c={T.fn}>observe</Tok>
    <Tok c={T.punct}>(</Tok>
    <Tok c={T.string}>challenge</Tok>
    <Tok c={T.punct}>)</Tok>
  </>,
  <>
    {sp(4)}
    <Tok c={T.punct}>.</Tok>
    <Tok c={T.fn}>adapt</Tok>
    <Tok c={T.punct}>().</Tok>
    <Tok c={T.fn}>grow</Tok>
    <Tok c={T.punct}>();</Tok>
  </>,
  <>
    <Tok c={T.punct}>{'}'}</Tok>
  </>,
];

const DEFAULT_COMMAND = (
  <>
    <Tok c={T.comment}>$</Tok> thiago<Tok c={T.punct}>(</Tok>
    <Tok c={T.string}>'a living interface'</Tok>
    <Tok c={T.punct}>)</Tok>
  </>
);

const DEFAULT_OUTPUT = (
  <>
    → <Tok c="#A9C0A2">{'{ state: '}</Tok>
    <Tok c={T.string}>'growing'</Tok>
    <Tok c="#A9C0A2">, uptime: </Tok>
    <Tok c={T.string}>'∞'</Tok>
    <Tok c="#A9C0A2">{' }'}</Tok>
  </>
);

export interface TerminalHeroProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  eyebrow?: ReactNode;
  title?: ReactNode;
  lede?: ReactNode;
  primaryLabel?: ReactNode;
  primaryHref?: string;
  secondaryLabel?: ReactNode;
  secondaryHref?: string;
  terminalTitle?: ReactNode;
  /** Code lines rendered in the terminal, each self-typed in sequence. */
  lines?: ReactNode[];
  command?: ReactNode;
  output?: ReactNode;
  /** Replay the type-in animation every `cycleMs`. */
  loop?: boolean;
  cycleMs?: number;
  showContours?: boolean;
}

/**
 * TerminalHero — the signature Biome Modernism hero: an editorial identity
 * column beside a self-typing terminal, over breathing topographic contours.
 */
export function TerminalHero({
  eyebrow = 'Software Engineer · São Paulo',
  title = DEFAULT_TITLE,
  lede = 'Resilient front-end architecture, real-time data, and the occasional living interface. Currently open to senior roles.',
  primaryLabel = 'Explore projects →',
  primaryHref = '#',
  secondaryLabel = 'Recruiter view ›',
  secondaryHref = '#',
  terminalTitle = '~/biome — node',
  lines = DEFAULT_LINES,
  command = DEFAULT_COMMAND,
  output = DEFAULT_OUTPUT,
  loop = true,
  cycleMs = 9500,
  showContours = true,
  className,
  ...rest
}: TerminalHeroProps) {
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loop) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (reduce?.matches) return undefined;
    const container = termRef.current;
    if (!container) return undefined;
    const id = window.setInterval(() => {
      const els = container.querySelectorAll<HTMLElement>('[data-th-anim]');
      els.forEach((el) => {
        el.style.animation = 'none';
      });
      void container.offsetWidth; // reflow → restart animations
      els.forEach((el) => {
        el.style.animation = '';
      });
    }, cycleMs);
    return () => window.clearInterval(id);
  }, [loop, cycleMs]);

  const base = 0.25;
  const step = 0.7;
  const outDelay = base + lines.length * step + 0.4;

  return (
    <section
      className={[styles.hero, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {showContours && (
        <div className={styles.contours}>
          <svg viewBox="0 0 1000 1000" width="100%" height="100%">
            <g className={styles.rings}>
              <circle
                cx="560"
                cy="500"
                r="96"
                fill="none"
                stroke="#8FB089"
                strokeWidth="1.3"
                opacity=".55"
              />
              <circle
                cx="560"
                cy="500"
                r="176"
                fill="none"
                stroke="#6E9B7E"
                strokeWidth="1.1"
                opacity=".42"
              />
              <circle
                cx="560"
                cy="500"
                r="258"
                fill="none"
                stroke="#6E9B7E"
                strokeWidth="1"
                opacity=".32"
              />
            </g>
            <g className={styles.ringsSlow}>
              <circle
                cx="560"
                cy="500"
                r="352"
                fill="none"
                stroke="#C8693B"
                strokeWidth="1"
                opacity=".26"
              />
              <circle
                cx="560"
                cy="500"
                r="452"
                fill="none"
                stroke="#8FB089"
                strokeWidth=".8"
                opacity=".16"
              />
              <circle
                cx="560"
                cy="500"
                r="560"
                fill="none"
                stroke="#6E8C7A"
                strokeWidth=".7"
                opacity=".12"
              />
            </g>
            <circle cx="560" cy="500" r="4" fill="#E8A627" />
          </svg>
        </div>
      )}

      <div className={styles.inner}>
        <div>
          <div className={styles.eyebrow}>{eyebrow}</div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.lede}>{lede}</p>
          <div className={styles.actions}>
            <a
              href={primaryHref}
              className={`${styles.action} ${styles.actionPrimary}`}
            >
              {primaryLabel}
            </a>
            <a
              href={secondaryHref}
              className={`${styles.action} ${styles.actionSecondary}`}
            >
              {secondaryLabel}
            </a>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.terminal}>
            <div className={styles.titlebar}>
              <span className={`${styles.dot} ${styles.dotRed}`} />
              <span className={`${styles.dot} ${styles.dotAmber}`} />
              <span className={`${styles.dot} ${styles.dotGreen}`} />
              <span className={styles.termTitle}>{terminalTitle}</span>
            </div>
            <div ref={termRef} className={styles.termBody}>
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={styles.line}
                  data-th-anim
                  style={{ animationDelay: `${base + i * step}s` }}
                >
                  {line}
                </div>
              ))}
              <div className={styles.commandLine}>
                {command}
                <span className={styles.caret} />
              </div>
              {output && (
                <div
                  className={styles.out}
                  data-th-anim
                  style={{ animationDelay: `${outDelay}s` }}
                >
                  {output}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
