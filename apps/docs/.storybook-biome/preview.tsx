import { useEffect } from 'react';
import type { Preview, Decorator } from '@storybook/react-vite';
// Biome-scoped design-sync reference config — component styles from the built
// biome package (hash-scoped classes match the bundled stylesheet).
import '@thijulio/primitives/styles.css';
import '@thijulio/biome-react/styles.css';
// Token + base CSS as a string, injected per story.
import biomeCss from '@thijulio/biome-css/biome.css?inline';

const BRAND_CSS: Record<string, string> = {
  Biome: biomeCss,
};

const withBrandTokens: Decorator = (Story, context) => {
  const brand = (context.title ?? '').split('/')[0];
  const css = BRAND_CSS[brand] ?? '';
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
    // a11y violations surface in the Accessibility panel; don't fail the build.
    a11y: { test: 'todo' },
  },
  // Globals only (no `toolbar`): the toolbar UI is rendered per-brand by the
  // manager addon (.storybook/manager.tsx), which shows the Biome mode control
  // only on Biome stories and the Exodus theme control only on Exodus stories.
  globalTypes: {
    mode: { description: 'Biome light / dark', defaultValue: 'light' },
    accent: { description: 'Exodus accent theme', defaultValue: 'sage' },
  },
  decorators: [withBrandTokens],
};

export default preview;
