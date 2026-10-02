import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';
import { expect, waitFor, within } from 'storybook/test';
import { contrastRatio } from '../_test/contrast';
import { hoverInBrowserTest } from '../_test/hover';
import fauneTokens from '@thijulio/faune-tokens/tokens.manifest.json';
import { ColorCatalog } from '../_foundations/ColorCatalog';
import {
  isSemanticColor,
  type ColorSection,
  type TokenManifest,
} from '../_foundations/token-manifest';
import {
  colorCatalogParameters,
  expectCompleteColorCatalog,
  expectCopyInteraction,
} from '../_test/catalog';

const manifest: TokenManifest = fauneTokens;

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

const SECTIONS: ColorSection[] = [
  {
    title: 'Brand palette — warm & founder-led',
    description:
      'Deep-teal ink, coral accent, yellow highlight, sage support, warm paper surfaces.',
    match: (t) => t.source === 'color.json' && !isSemanticColor(t),
  },
  {
    title: 'Semantics — fixed meaning',
    description:
      'success / warning / danger / info. Never reskin with a theme.',
    match: isSemanticColor,
  },
  {
    title: 'Contract — the shared language',
    description:
      'Every brand aliases its palette into --ds-*; @thijulio/primitives skins from these.',
    match: (t) => t.source === 'contract.json',
  },
];

export const Colors: Story = {
  parameters: colorCatalogParameters,
  play: async ({ canvasElement }) => {
    await expectCompleteColorCatalog(canvasElement, manifest);
    await expectCopyInteraction(canvasElement, 'var(--ink)');
    await expectCopyInteraction(canvasElement, 'tokens.ink');
  },
  render: () => (
    <ColorCatalog brand="faune" manifest={manifest} sections={SECTIONS} />
  ),
};

export const LinksHovered: Story = {
  render: () => <a href="#details">Read more about Faune</a>,
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    if (!(await hoverInBrowserTest(link))) return;
    await waitFor(() =>
      expect(
        contrastRatio(
          getComputedStyle(link).color,
          getComputedStyle(document.body).backgroundColor,
        ),
      ).toBeGreaterThanOrEqual(4.5),
    );
  },
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
