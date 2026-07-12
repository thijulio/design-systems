import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

const meta: Meta = { title: 'Exodus/Foundations' };
export default meta;
type Story = StoryObj;

const sans: CSSProperties = { fontFamily: 'var(--font-sans)' };

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
    <section style={{ marginBottom: 34, ...sans }}>
      <h3
        style={{
          fontSize: 21,
          fontWeight: 700,
          color: 'var(--n-900)',
          margin: '0 0 2px',
        }}
      >
        {title}
      </h3>
      {desc && (
        <p style={{ color: 'var(--n-500)', margin: '0 0 14px', fontSize: 14 }}>
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
  usage,
  fg = 'var(--n-800)',
}: {
  name: string;
  bg: string;
  hex?: string;
  usage?: string;
  fg?: string;
}) {
  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--n-200)',
        background: '#fff',
      }}
    >
      <div style={{ height: 76, background: bg }} />
      <div style={{ padding: '9px 11px' }}>
        <div style={{ fontWeight: 700, color: fg, fontSize: 13 }}>{name}</div>
        {(hex || usage) && (
          <div style={{ fontSize: 12, color: 'var(--n-500)' }}>
            {[hex, usage].filter(Boolean).join(' · ')}
          </div>
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

const NEUTRALS = [
  ['50', '#f8f7f5'],
  ['100', '#f0eeea'],
  ['200', '#e3e0d9'],
  ['300', '#cbc6bb'],
  ['400', '#a8a294'],
  ['500', '#847d6e'],
  ['600', '#696255'],
  ['700', '#524d43'],
  ['800', '#3a3730'],
  ['900', '#26241f'],
] as const;

const SEMANTICS = [
  ['success', '#3f8f5b'],
  ['warning', '#b9821f'],
  ['danger', '#c0492f'],
  ['info', '#3a6ea5'],
] as const;

const TONES = ['neutral', 'amber', 'blue', 'green', 'teal', 'violet', 'red'];

export const Colors: Story = {
  render: () => (
    <div>
      <Section
        title="Accent — theme-driven"
        desc="The brand ramp reskins per data-theme (Sage default). See Themes."
      >
        <Grid>
          <Swatch name="accent-soft" bg="var(--accent-soft)" usage="tint bg" />
          <Swatch
            name="accent"
            bg="var(--accent)"
            usage="primary fill"
            fg="var(--n-900)"
          />
          <Swatch
            name="accent-strong"
            bg="var(--accent-strong)"
            usage="hover"
          />
        </Grid>
      </Section>

      <Section
        title="Neutrals — warm stone"
        desc="Warm, not cool grey. Surfaces 50/100, borders 200/300, text 700/900."
      >
        <Grid min={92}>
          {NEUTRALS.map(([step, hex]) => (
            <Swatch
              key={step}
              name={`n-${step}`}
              bg={`var(--n-${step})`}
              hex={hex}
            />
          ))}
        </Grid>
      </Section>

      <Section
        title="Semantics — fixed meaning"
        desc="success / warning / danger / info. Never reskin with the accent theme."
      >
        <Grid>
          {SEMANTICS.map(([name, hex]) => (
            <Swatch
              key={name}
              name={name}
              bg={`var(--${name})`}
              hex={hex}
              fg="var(--n-900)"
            />
          ))}
        </Grid>
      </Section>

      <Section
        title="Status tones — 7 fixed"
        desc="Lifecycle states map onto these; a state's colour never themes."
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TONES.map((t) => (
            <span
              key={t}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                background: `var(--tone-${t}-soft)`,
                color: `var(--tone-${t}-fg)`,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: `var(--tone-${t}-dot)`,
                }}
              />
              {t}
            </span>
          ))}
        </div>
      </Section>
    </div>
  ),
};

export const Themes: Story = {
  render: () => (
    <Section
      title="Accent themes"
      desc="Same aliases, three ramps — profile-type theming via data-theme."
    >
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          ['sage', 'default'],
          ['clay', 'rescue'],
          ['harbor', 'association'],
        ].map(([theme, use]) => (
          <div
            key={theme}
            data-theme={theme}
            style={{
              ...sans,
              border: '1px solid var(--n-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 14,
              minWidth: 150,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: 'var(--n-900)',
                textTransform: 'capitalize',
              }}
            >
              {theme}
            </div>
            <div
              style={{ fontSize: 12, color: 'var(--n-500)', marginBottom: 10 }}
            >
              {use}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: 'var(--accent-soft)',
                }}
              />
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: 'var(--accent)',
                }}
              />
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: 'var(--accent-strong)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  ),
};

export const Typography: Story = {
  render: () => {
    const scale: [string, string, string][] = [
      ['--text-display', '38 / 800', 'Find your companion'],
      ['--text-h1', '27 / 800', 'Recent animals'],
      ['--text-h2', '21 / 700', 'Spring 2026 litter'],
      ['--text-h3', '16 / 700', 'Vaccination record'],
      ['--text-body', '15 / 400', 'Every animal has a health timeline.'],
      ['--text-caption', '12 / 500', 'Updated 4 days ago · Coimbra'],
    ];
    return (
      <div>
        <Section
          title="Families"
          desc="Hanken Grotesk carries all UI & body. Baloo 2 is the PMP wordmark only."
        >
          <div
            style={{
              ...sans,
              fontSize: 24,
              color: 'var(--n-900)',
              marginBottom: 6,
            }}
          >
            Hanken Grotesk — 400 / 500 / 600 / 700 / 800
          </div>
          <div
            style={{
              fontFamily: 'var(--font-wordmark)',
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--accent)',
            }}
          >
            PMP{' '}
            <span style={{ ...sans, fontSize: 13, color: 'var(--n-500)' }}>
              · Baloo 2, wordmark only
            </span>
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
                  ...sans,
                  fontSize: 12,
                  color: 'var(--n-500)',
                  width: 60,
                }}
              >
                {meta2}
              </span>
              <span
                style={{
                  ...sans,
                  fontSize: `var(${v})`,
                  color: 'var(--n-900)',
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

export const Spacing: Story = {
  render: () => {
    const steps = [4, 8, 12, 16, 20, 24, 32, 48];
    const radii: [string, string][] = [
      ['--radius-sm', 'sm · 6'],
      ['--radius-md', 'md · 9'],
      ['--radius-lg', 'lg · 12'],
      ['--radius-xl', 'xl · 16'],
    ];
    const shadows: [string, string][] = [
      ['--shadow-xs', 'xs'],
      ['--shadow-sm', 'sm'],
      ['--shadow-md', 'md'],
      ['--shadow-lg', 'lg'],
    ];
    return (
      <div>
        <Section title="Spacing scale" desc="4px base.">
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
                  ...sans,
                  fontSize: 12,
                  color: 'var(--n-500)',
                  width: 28,
                }}
              >
                {n}
              </span>
              <span
                style={{
                  height: 14,
                  width: n,
                  background: 'var(--accent)',
                  borderRadius: 3,
                }}
              />
            </div>
          ))}
        </Section>
        <Section title="Radius">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {radii.map(([v, label]) => (
              <div key={v} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    background: 'var(--accent)',
                    borderRadius: `var(${v})`,
                    marginBottom: 6,
                  }}
                />
                <span style={{ ...sans, fontSize: 12, color: 'var(--n-500)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Elevation — warm-tinted">
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {shadows.map(([v, label]) => (
              <div key={v} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 90,
                    height: 60,
                    background: '#fff',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: `var(${v})`,
                    marginBottom: 8,
                  }}
                />
                <span style={{ ...sans, fontSize: 12, color: 'var(--n-500)' }}>
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
