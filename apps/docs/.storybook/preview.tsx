import { useEffect } from 'react';
import type { Preview, Decorator } from '@storybook/react-vite';
// Component styles from the built packages — hash-scoped, so loading both brands
// globally is safe (no :root collision).
import '@thijulio/biome-react/styles.css';
import '@thijulio/exodus-react/styles.css';
// Token + base CSS as strings; only the active brand's is injected per story
// (Biome and Exodus both scope tokens to :root and share a few generic var names).
import biomeCss from '@thijulio/biome-css/biome.css?inline';
import exodusCss from '@thijulio/exodus-css/exodus.css?inline';

const BRAND_CSS: Record<string, string> = {
  Biome: biomeCss,
  Exodus: exodusCss,
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
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: { storySort: { order: ['Biome', 'Exodus'] } },
  },
  globalTypes: {
    // Each control is brand-specific: Mode affects Biome stories only, Accent
    // affects Exodus stories only. Item titles name the brand so it's obvious
    // which one a given control drives (toggling the other brand's control on a
    // story is a no-op by design).
    mode: {
      description: 'Biome light / dark (Biome stories only)',
      defaultValue: 'light',
      toolbar: {
        title: 'Biome mode',
        icon: 'circlehollow',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Biome · Light', icon: 'sun' },
          { value: 'dark', title: 'Biome · Dark', icon: 'moon' },
        ],
      },
    },
    accent: {
      description: 'Exodus accent theme (Exodus stories only)',
      defaultValue: 'sage',
      toolbar: {
        title: 'Exodus theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'sage', title: 'Exodus · Sage' },
          { value: 'clay', title: 'Exodus · Clay' },
          { value: 'harbor', title: 'Exodus · Harbor' },
        ],
      },
    },
  },
  decorators: [withBrandTokens],
};

export default preview;
