import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

const meta: Meta = { title: 'Faune/Foundations' };
export default meta;
type Story = StoryObj;

const body: CSSProperties = { fontFamily: 'var(--font-body)' };

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 34, ...body }}>
      <h3
        style={{
          fontSize: 21,
          fontWeight: 700,
          color: 'var(--ink)',
          margin: '0 0 2px',
        }}
      >
        {title}
      </h3>
      {desc && (
        <p
          style={{
            color: 'var(--ink-muted)',
            margin: '0 0 14px',
            fontSize: 14,
          }}
        >
          {desc}
        </p>
      )}
      {children}
    </section>
  );
}

function Swatch({
  name,
  bg,
  hex,
  fg = 'var(--ink)',
}: {
  name: string;
  bg: string;
  hex?: string;
  fg?: string;
}) {
  return (
    <div
      style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--line)',
        background: 'var(--cream)',
      }}
    >
      <div style={{ height: 76, background: bg }} />
      <div style={{ padding: '9px 11px' }}>
        <div style={{ fontWeight: 700, color: fg, fontSize: 13 }}>{name}</div>
        {hex && (
          <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{hex}</div>
        )}
      </div>
    </div>
  );
}

function Grid({ min = 130, children }: { min?: number; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
        gap: 10,
        maxWidth: 760,
      }}
    >
      {children}
    </div>
  );
}

const BRAND = [
  ['ink', '#183d3c', 'var(--ink)', 'var(--cream)'],
  ['coral', '#e56c50', 'var(--coral)', 'var(--cream)'],
  ['yellow', '#e7c35b', 'var(--yellow)', 'var(--ink)'],
  ['sage', '#b6c8b2', 'var(--sage)', 'var(--ink)'],
  ['paper', '#f7f4ed', 'var(--paper)', 'var(--ink)'],
  ['cream', '#fffdf8', 'var(--cream)', 'var(--ink)'],
] as const;

const SEMANTICS = [
  ['success', '#31715e'],
  ['warning', '#b9821f'],
  ['danger', '#c94e39'],
  ['info', '#3b6964'],
] as const;

export const Colors: Story = {
  render: () => (
    <div>
      <Section
        title="Brand palette — warm & founder-led"
        desc="Deep-teal ink, coral accent, yellow highlight, sage support, warm paper surfaces."
      >
        <Grid>
          {BRAND.map(([name, hex, bg, fg]) => (
            <Swatch key={name} name={name} hex={hex} bg={bg} fg={fg} />
          ))}
        </Grid>
      </Section>

      <Section
        title="Semantics — fixed meaning"
        desc="success / warning / danger / info. Never reskin with a theme."
      >
        <Grid>
          {SEMANTICS.map(([name, hex]) => (
            <Swatch
              key={name}
              name={name}
              hex={hex}
              bg={`var(--${name})`}
              fg="var(--cream)"
            />
          ))}
        </Grid>
      </Section>

      <Section
        title="Contract — the shared language"
        desc="Every brand aliases its palette into --ds-*; @thijulio/primitives skins from these."
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            ['--ds-surface', 'var(--paper)'],
            ['--ds-brand', 'var(--ink)'],
            ['--ds-accent', 'var(--coral)'],
            ['--ds-highlight', 'var(--yellow)'],
          ].map(([name, bg]) => (
            <span
              key={name}
              style={{
                ...body,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--line)',
                background: 'var(--cream)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: bg,
                  border: '1px solid var(--line)',
                }}
              />
              {name}
            </span>
          ))}
        </div>
      </Section>
    </div>
  ),
};

export const Typography: Story = {
  render: () => {
    const scale: [string, string, string][] = [
      ['--text-display', 'clamp(3rem→5.5rem)', 'Une maison pour votre chat'],
      ['--text-h1', 'clamp(2.75rem→4.55rem)', 'Le soin, comme à la maison'],
      ['--text-h2', '2rem', 'Nos services'],
      ['--text-h3', '1.25rem', 'Pet Passport'],
      ['--text-body', '1rem', 'Visites, repas et nouvelles photo chaque jour.'],
      ['--text-caption', '0.75rem', 'Bordeaux · Disponible'],
    ];
    return (
      <div>
        <Section
          title="Families"
          desc="Newsreader carries the serif display voice; Inter is body + UI."
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 30,
              color: 'var(--ink)',
              marginBottom: 6,
            }}
          >
            Newsreader — display, 400/500/600
          </div>
          <div style={{ ...body, fontSize: 17, color: 'var(--ink-muted)' }}>
            Inter — body &amp; UI, 400/500/600/700/800
          </div>
        </Section>
        <Section title="Type scale" desc="Display → caption.">
          {scale.map(([v, meta2, sample]) => (
            <div
              key={v}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 16,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  ...body,
                  fontSize: 12,
                  color: 'var(--ink-muted)',
                  width: 150,
                }}
              >
                {meta2}
              </span>
              <span
                style={{
                  ...(v === '--text-display' ||
                  v === '--text-h1' ||
                  v === '--text-h2' ||
                  v === '--text-h3'
                    ? { fontFamily: 'var(--font-display)' }
                    : body),
                  fontSize: `var(${v})`,
                  color: 'var(--ink)',
                }}
              >
                {sample}
              </span>
            </div>
          ))}
        </Section>
      </div>
    );
  },
};

export const Shape: Story = {
  render: () => {
    const radii: [string, string][] = [
      ['--radius-sm', 'sm · 10'],
      ['--radius-md', 'md · 14'],
      ['--radius-lg', 'lg · 1.5rem'],
      ['--radius-xl', 'xl · 2.3rem'],
    ];
    return (
      <div>
        <Section
          title="Radius"
          desc="Generous, organic corners — the signature roundness."
        >
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {radii.map(([v, label]) => (
              <div key={v} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 84,
                    height: 84,
                    background: 'var(--coral)',
                    borderRadius: `var(${v})`,
                    marginBottom: 6,
                  }}
                />
                <span
                  style={{ ...body, fontSize: 12, color: 'var(--ink-muted)' }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Elevation — warm-tinted">
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              ['--shadow-sm', 'sm'],
              ['--shadow-md', 'md'],
              ['--shadow-lg', 'lg'],
            ].map(([v, label]) => (
              <div key={v} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 96,
                    height: 64,
                    background: 'var(--cream)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: `var(${v})`,
                    marginBottom: 8,
                  }}
                />
                <span
                  style={{ ...body, fontSize: 12, color: 'var(--ink-muted)' }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    );
  },
};
