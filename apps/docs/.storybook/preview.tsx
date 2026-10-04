import { useEffect } from 'react';
import type { Preview, Decorator } from '@storybook/react-vite';
// Component styles from the built packages — hash-scoped, so loading both brands
// globally is safe (no :root collision).
import '@thijulio/biome-react/styles.css';
import '@thijulio/exodus-react/styles.css';
import '@thijulio/primitives/styles.css';
// Token + base CSS as strings; only the active brand's is injected per story
// (Biome and Exodus both scope tokens to :root and share a few generic var names).
import biomeCss from '@thijulio/biome-css/biome.css?inline';
import exodusCss from '@thijulio/exodus-css/exodus.css?inline';
import fauneCss from '@thijulio/faune-css/faune.css?inline';

import { type DesignSystem, designSystemOf } from './design-system';

const BRAND_CSS: Record<DesignSystem, string> = {
  Biome: biomeCss,
  Exodus: exodusCss,
  Faune: fauneCss,
};

const withBrandTokens: Decorator = (Story, context) => {
  const brand = designSystemOf(context.title);
  const css = brand ? BRAND_CSS[brand] : '';
  const mode = context.globals.mode as string;
  const accent = context.globals.accent as string;

  useEffect(() => {
    let el = document.getElementById('brand-tokens') as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = 'brand-tokens';
      document.head.appendChild(el);
    }
    el.textContent = css;
    document.documentElement.setAttribute('data-mode', mode);
    document.documentElement.setAttribute('data-theme', accent);
  }, [css, mode, accent]);

  return (
    <div style={{ padding: 24 }}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  // Every component meta with a `component` gets an auto-generated Docs page
  // (overview + all its stories rendered live with source). Opt a story out
  // with `tags: ['!autodocs']`.
  tags: ['autodocs'],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      // One tree per design system, all the same shape (design-system.ts
      // SECTIONS — repeated as literals because Storybook reads storySort
      // statically). The manager's picker shows one design system at a time.
      storySort: {
        order: [
          'Introduction',
          'Biome',
          ['Foundations', 'Components', 'Migration'],
          'Exodus',
          ['Foundations', 'Components', 'Migration'],
          'Faune',
          ['Foundations', 'Components', 'Migration'],
        ],
      },
    },
    // A component catalog is a quality gate: supported stories must not carry
    // known accessibility violations into a release.
    a11y: { test: 'error' },
  },
  // Globals only (no `toolbar`): the toolbar UI is the manager addon
  // (.storybook/manager.tsx) — a design-system picker plus the active design
  // system's theme control (Biome mode, Exodus accent).
  globalTypes: {
    mode: { description: 'Biome light / dark', defaultValue: 'light' },
    accent: { description: 'Exodus accent theme', defaultValue: 'sage' },
  },
  decorators: [withBrandTokens],
};

export default preview;
