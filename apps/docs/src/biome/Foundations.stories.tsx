import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

const meta: Meta = { title: 'Biome/Foundations' };
export default meta;
type Story = StoryObj;

const mono: CSSProperties = { fontFamily: 'var(--font-mono)' };

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
    <section style={{ marginBottom: 34, fontFamily: 'var(--font-reading)' }}>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 22,
          color: 'var(--text-strong)',
          margin: '0 0 2px',
        }}
      >
        {title}
      </h3>
      {desc && (
        <p
          style={{
            color: 'var(--text-muted)',
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
  cssVar,
  hex,
  usage,
}: {
  name: string;
  cssVar: string;
  hex: string;
  usage: string;
}) {
  return (
    <div
      style={{
        borderRadius: 'var(--radius-ui-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'var(--surface-raised)',
      }}
    >
      <div style={{ height: 92, background: `var(${cssVar})` }} />
      <div style={{ padding: '10px 12px' }}>
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            color: 'var(--text-strong)',
            fontSize: 14,
          }}
        >
          {name}
        </div>
        <div style={{ ...mono, fontSize: 12, color: 'var(--text-muted)' }}>
          {hex} · {usage}
        </div>
      </div>
    </div>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 12,
        maxWidth: 720,
      }}
    >
      {children}
    </div>
  );
}

export const Colors: Story = {
  render: () => (
    <div>
      <Section
        title="Greens — primary"
        desc="Mata leads, cerrado supports; bone is the warm ground."
      >
        <Grid>
          <Swatch name="Bone" cssVar="--bm-bone" hex="#F2EEE2" usage="ground" />
          <Swatch
            name="Mata"
            cssVar="--bm-mata"
            hex="#3F5237"
            usage="primary"
          />
          <Swatch
            name="Cerrado"
            cssVar="--bm-cerrado"
            hex="#6E7A48"
            usage="secondary"
          />
          <Swatch
            name="Mata Deep"
            cssVar="--bm-mata-deep"
            hex="#2E3D28"
            usage="hover"
          />
        </Grid>
      </Section>

      <Section title="Neutrals — warm stone">
        <Grid>
          <Swatch
            name="Pine Ink"
            cssVar="--bm-ink"
            hex="#232A20"
            usage="text"
          />
          <Swatch
            name="Soft Ink"
            cssVar="--bm-ink-soft"
            hex="#4A4A3E"
            usage="body"
          />
          <Swatch
            name="Stone"
            cssVar="--bm-stone"
            hex="#8C8275"
            usage="muted"
          />
          <Swatch
            name="Bone Raised"
            cssVar="--bm-bone-raised"
            hex="#F8F5EC"
            usage="surface"
          />
        </Grid>
      </Section>

      <Section title="Warm — accents">
        <Grid>
          <Swatch
            name="Terracotta"
            cssVar="--bm-terracotta"
            hex="#B5532A"
            usage="accent"
          />
          <Swatch
            name="Ipê"
            cssVar="--bm-ipe"
            hex="#E8A627"
            usage="highlight"
          />
        </Grid>
      </Section>

      <Section
        title="Dark mode"
        desc="Designed alternate — warm & green, not inverted."
      >
        <Grid>
          <Swatch
            name="Canopy"
            cssVar="--bm-canopy"
            hex="#161D16"
            usage="ground"
          />
          <Swatch
            name="Understory"
            cssVar="--bm-understory"
            hex="#1E261E"
            usage="surface"
          />
          <Swatch
            name="Sage"
            cssVar="--bm-sage"
            hex="#8FB089"
            usage="primary"
          />
          <Swatch
            name="Terracotta"
            cssVar="--bm-terracotta-dk"
            hex="#C8693B"
            usage="accent"
          />
        </Grid>
      </Section>
    </div>
  ),
};

export const Typography: Story = {
  render: () => {
    const scale: [string, string, string][] = [
      ['--size-2xl', '52', 'Biome Modernism'],
      ['--size-xl', '34', 'Growing systems'],
      ['--size-lg', '26', 'On living architecture'],
      ['--size-md', '19', 'Body reading size'],
      ['--size-sm', '14', 'UI label size'],
    ];
    const families: [string, string, string][] = [
      [
        '--font-display',
        'Newsreader — display',
        'Growing systems, not building them',
      ],
      [
        '--font-reading',
        'Spectral — reading',
        'The best architectures behave less like machines and more like ecosystems.',
      ],
      [
        '--font-ui',
        'Space Grotesk — UI',
        'Experience · Projects · Writing · Now',
      ],
      [
        '--font-mono',
        'JetBrains Mono — data',
        '$ available · são paulo · open to roles',
      ],
    ];
    return (
      <div>
        <Section
          title="Type scale"
          desc="1.25 major third · display → caption."
        >
          {scale.map(([v, px, sample]) => (
            <div
              key={v}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 16,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  ...mono,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  width: 40,
                }}
              >
                {px}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: `var(${v})`,
                  color: 'var(--text-strong)',
                  lineHeight: 1.1,
                }}
              >
                {sample}
              </span>
            </div>
          ))}
        </Section>
        <Section
          title="Families"
          desc="Four roles: display, reading, UI, data."
        >
          {families.map(([v, label, sample]) => (
            <div key={v} style={{ marginBottom: 16, maxWidth: 640 }}>
              <div
                style={{ ...mono, fontSize: 12, color: 'var(--text-muted)' }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: `var(${v})`,
                  fontSize: 20,
                  color: 'var(--text-body)',
                }}
              >
                {sample}
              </div>
            </div>
          ))}
        </Section>
      </div>
    );
  },
};

export const Spacing: Story = {
  render: () => {
    const steps = [4, 8, 12, 16, 24, 32, 48, 64, 96];
    const radii: [string, string][] = [
      ['--radius-ui', 'ui · 6'],
      ['--radius-pill', 'pill · 100'],
      ['--radius-soft', 'soft · 24'],
    ];
    return (
      <div>
        <Section
          title="Spacing scale"
          desc="8pt-ish base, tuned for editorial rhythm."
        >
          {steps.map((n) => (
            <div
              key={n}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  ...mono,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  width: 32,
                }}
              >
                {n}
              </span>
              <span
                style={{
                  height: 14,
                  width: n,
                  background: 'var(--brand)',
                  borderRadius: 3,
                }}
              />
            </div>
          ))}
        </Section>
        <Section
          title="Radii — mixed"
          desc="Tight geometry for UI, soft curves for expressive surfaces."
        >
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {radii.map(([v, label]) => (
              <div key={v} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    background: 'var(--brand)',
                    borderRadius: `var(${v})`,
                    marginBottom: 6,
                  }}
                />
                <span
                  style={{ ...mono, fontSize: 12, color: 'var(--text-muted)' }}
                >
                  {label}
                </span>
              </div>
            ))}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  background: 'var(--brand)',
                  borderRadius: 'var(--radius-organic)',
                  marginBottom: 6,
                }}
              />
              <span
                style={{ ...mono, fontSize: 12, color: 'var(--text-muted)' }}
              >
                organic
              </span>
            </div>
          </div>
        </Section>
      </div>
    );
  },
};

export const Motion: Story = {
  render: () => (
    <Section
      title="Motion"
      desc="Calm by default, reactive on intent. Movement is biology, not decoration."
    >
      <ul
        style={{
          ...mono,
          fontSize: 14,
          color: 'var(--text-body)',
          lineHeight: 2,
          paddingLeft: 18,
        }}
      >
        <li>at rest → breathe (var(--breath) = 9s)</li>
        <li>hover → quicken (var(--dur-fast) = 0.25s, var(--ease-organic))</li>
        <li>scroll → grow &amp; reveal</li>
        <li>prefers-reduced-motion → static</li>
      </ul>
    </Section>
  ),
};
