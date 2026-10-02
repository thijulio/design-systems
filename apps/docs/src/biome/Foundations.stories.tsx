import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';
import biomeTokens from '@thijulio/biome-tokens/tokens.manifest.json';
import { ColorCatalog } from '../_foundations/ColorCatalog';
import type {
  ColorSection,
  TokenManifest,
} from '../_foundations/token-manifest';
import {
  colorCatalogParameters,
  expectCompleteColorCatalog,
  expectCopyInteraction,
} from '../_test/catalog';

const manifest: TokenManifest = biomeTokens;

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
            color: 'var(--text-body)',
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

const SECTIONS: ColorSection[] = [
  {
    title: 'Palette — bm',
    description:
      'Raw Biome palette. Components reach for the semantic layer, not these.',
    match: (t) => t.source === 'palette.json',
  },
  {
    title: 'Semantic',
    description:
      'Role aliases components use. Dark mode reassigns them; toggle Mode in the toolbar.',
    match: (t) => t.source === 'semantic.json',
  },
  {
    title: 'Components',
    description: 'Component-scoped tokens (TerminalHero, nav).',
    match: (t) => t.source === 'components.json',
  },
  {
    title: 'Contract — --ds-*',
    description:
      'What @thijulio/primitives reads. Each aliases a semantic token above.',
    match: (t) => t.source === 'contract.json',
  },
];

// Editorial names from the previous hand-made swatches, kept by CSS name.
const NOTES: Record<string, string> = {
  '--bm-bone': 'Bone · ground',
  '--bm-bone-raised': 'Bone Raised · surface',
  '--bm-mata': 'Mata · primary',
  '--bm-mata-deep': 'Mata Deep · hover',
  '--bm-cerrado': 'Cerrado · secondary',
  '--bm-ink': 'Pine Ink · text',
  '--bm-ink-soft': 'Soft Ink · body',
  '--bm-stone': 'Stone · muted',
  '--bm-terracotta': 'Terracotta · accent',
  '--bm-ipe': 'Ipê · highlight',
  '--bm-canopy': 'Canopy · dark ground',
  '--bm-understory': 'Understory · dark surface',
  '--bm-sage': 'Sage · dark primary',
  '--bm-terracotta-dk': 'Terracotta · dark accent',
};

export const Colors: Story = {
  parameters: colorCatalogParameters,
  play: async ({ canvasElement }) => {
    await expectCompleteColorCatalog(canvasElement, manifest, NOTES);
    await expectCopyInteraction(canvasElement, 'var(--brand)');
    await expectCopyInteraction(canvasElement, 'tokens.brand');
  },
  render: () => (
    <ColorCatalog
      brand="biome"
      manifest={manifest}
      sections={SECTIONS}
      notes={NOTES}
    />
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
                  color: 'var(--text-body)',
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
              <div style={{ ...mono, fontSize: 12, color: 'var(--text-body)' }}>
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
                  color: 'var(--text-body)',
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
                  style={{ ...mono, fontSize: 12, color: 'var(--text-body)' }}
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
                style={{ ...mono, fontSize: 12, color: 'var(--text-body)' }}
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

function MotionDemo({
  label,
  token,
  children,
}: {
  label: string;
  token: string;
  children: ReactNode;
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 120,
          height: 120,
          display: 'grid',
          placeItems: 'center',
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-ui-lg)',
        }}
      >
        {children}
      </div>
      <div style={{ marginTop: 8, ...mono, fontSize: 12 }}>
        <div style={{ color: 'var(--text-strong)' }}>{label}</div>
        <div style={{ color: 'var(--text-body)' }}>{token}</div>
      </div>
    </div>
  );
}

export const Motion: Story = {
  render: () => (
    <Section
      title="Motion"
      desc="Calm by default, reactive on intent. Movement is biology, not decoration. (Hover the last tile.)"
    >
      <style>{`
        .bm-quicken { transition: transform var(--dur-fast) var(--ease-organic), box-shadow var(--dur-fast) ease; }
        .bm-quicken:hover { transform: translateY(-6px); box-shadow: 0 16px 34px -16px rgba(35,42,32,.5); }
      `}</style>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <MotionDemo label="at rest → breathe" token="--breath · 9s">
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: 'var(--brand)',
              animation: 'bm-breath var(--breath) ease-in-out infinite',
            }}
          />
        </MotionDemo>

        <MotionDemo label="ipê glow" token="bm-glow · --breath">
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-organic)',
              background: 'var(--accent-highlight)',
              animation: 'bm-glow var(--breath) ease-in-out infinite',
            }}
          />
        </MotionDemo>

        <MotionDemo label="hover → quicken" token="--dur-fast · 0.25s">
          <div
            className="bm-quicken"
            style={{
              width: 68,
              height: 68,
              borderRadius: 'var(--radius-ui-lg)',
              background: 'var(--brand-2)',
              cursor: 'pointer',
            }}
          />
        </MotionDemo>
      </div>
      <p style={{ color: 'var(--text-body)', fontSize: 14, marginTop: 20 }}>
        Everything decorative freezes under{' '}
        <code style={{ ...mono }}>prefers-reduced-motion: reduce</code>.
      </p>
    </Section>
  ),
};
