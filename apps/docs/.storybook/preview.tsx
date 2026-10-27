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

import {
  activeDesignSystem,
  DEFAULT_DESIGN_SYSTEM,
  type DesignSystem,
} from './design-system';

const IN_VITEST_BROWSER = '__vitest_browser__' in globalThis;

const BRAND_CSS: Record<DesignSystem, string> = {
  Biome: biomeCss,
  Exodus: exodusCss,
  Faune: fauneCss,
};

// A branded title (`Exodus/…`) names its brand; a shared `Components/…` story
// takes the one picked in the toolbar (the `designSystem` global).
const withBrandTokens: Decorator = (Story, context) => {
  const brand = activeDesignSystem(context.title, context.globals.designSystem);
  const css = brand ? BRAND_CSS[brand] : '';
  const mode = context.globals.mode as string;
  const accent = context.globals.accent as string;
  const storyId = context.id;

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
    // Marks whose brand/mode/accent is applied. Test files share one page
    // (`isolate: false` in vitest.config.ts), so the previous file's brand CSS
    // is still here until this effect runs; checks wait for their own id.
    el.dataset.storyId = storyId;
  }, [css, mode, accent, storyId]);

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
      // The shared Components tree, then one tree per design system, all the
      // same shape (design-system.ts SHARED_ROOT and SECTIONS — repeated as
      // literals because Storybook reads storySort statically). The manager's
      // picker shows the shared tree plus one design system at a time.
      storySort: {
        order: [
          'Introduction',
          'Components',
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
    a11y: {
      test: 'error',
      // Under Vitest, addon-vitest streams each story's whole axe result to the
      // Node orchestrator on every task update. Every node of every passing
      // rule made that ~50 MB per run, parsed on the thread that also drives
      // Playwright, so hover actions starved into timeouts. The gate reads only
      // violations; the interactive panel keeps the full result.
      ...(IN_VITEST_BROWSER && {
        options: { resultTypes: ['violations', 'incomplete'] },
      }),
    },
  },
  // Globals only (no `toolbar`): the toolbar UI is the manager addon
  // (.storybook/manager.tsx) — a design-system picker (which also sets
  // `designSystem`, the brand shared stories render in) plus the active design
  // system's theme control (Biome mode, Exodus accent).
  globalTypes: {
    designSystem: {
      description: 'Design system the shared Components stories render in',
      defaultValue: DEFAULT_DESIGN_SYSTEM,
    },
    mode: { description: 'Biome light / dark', defaultValue: 'light' },
    accent: { description: 'Exodus accent theme', defaultValue: 'sage' },
  },
  decorators: [withBrandTokens],
};

export default preview;
