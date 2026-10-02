import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';
import exodusTokens from '@thijulio/exodus-tokens/tokens.manifest.json';
import { ColorCatalog } from '../_foundations/ColorCatalog';
import {
  isSemanticColor,
  type ColorSection,
  type TokenManifest,
} from '../_foundations/token-manifest';
import {
  expectCompleteColorCatalog,
  expectCopyInteraction,
} from '../_test/catalog';

const manifest: TokenManifest = exodusTokens;

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
        <p style={{ color: 'var(--n-600)', margin: '0 0 14px', fontSize: 14 }}>
          {desc}
        </p>
      )}
      {children}
    </section>
  );
}

const SECTIONS: ColorSection[] = [
  {
    title: 'Accent — theme-driven',
    description:
      'The brand ramp reskins per data-theme (Sage default). Switch theme in the toolbar; see Themes.',
    match: (t) => t.name.startsWith('--accent'),
  },
  {
    title: 'Neutrals — warm stone',
    description:
      'Warm, not cool grey. Surfaces 50/100, borders 200/300, text 700/900.',
    match: (t) => t.name.startsWith('--n-'),
  },
  {
    title: 'Semantics — fixed meaning',
    description:
      'success / warning / danger / info. Never reskin with the accent theme.',
    match: isSemanticColor,
  },
  {
    title: 'Status tones — 7 fixed',
    description:
      "Lifecycle states map onto these; a state's colour never themes.",
    match: (t) => t.name.startsWith('--tone-'),
  },
  {
    title: 'Contract — --ds-*',
    description:
      'What @thijulio/primitives reads. Each aliases an Exodus token above.',
    match: (t) => t.source === 'contract.json',
  },
];

const NOTES: Record<string, string> = {
  '--accent-soft': 'tint bg',
  '--accent': 'primary fill',
  '--accent-strong': 'hover',
};

export const Colors: Story = {
  play: async ({ canvasElement }) => {
    await expectCompleteColorCatalog(canvasElement, manifest, NOTES);
    await expectCopyInteraction(canvasElement, 'var(--accent)');
    await expectCopyInteraction(canvasElement, 'tokens.accent');
  },
  render: () => (
    <ColorCatalog
      brand="exodus"
      manifest={manifest}
      sections={SECTIONS}
      notes={NOTES}
    />
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
              style={{ fontSize: 12, color: 'var(--n-600)', marginBottom: 10 }}
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
            <span style={{ ...sans, fontSize: 13, color: 'var(--n-600)' }}>
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
                  color: 'var(--n-600)',
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
                  color: 'var(--n-600)',
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
                <span style={{ ...sans, fontSize: 12, color: 'var(--n-600)' }}>
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
                <span style={{ ...sans, fontSize: 12, color: 'var(--n-600)' }}>
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
