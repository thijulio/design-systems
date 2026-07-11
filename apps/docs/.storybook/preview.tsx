import { useEffect } from 'react';
import type { Preview, Decorator } from '@storybook/react-vite';
// Built token+base CSS as strings; only the active brand's is injected per story
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
    mode: {
      description: 'Biome light / dark',
      defaultValue: 'light',
      toolbar: {
        title: 'Mode',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
    accent: {
      description: 'Exodus accent theme',
      defaultValue: 'sage',
      toolbar: {
        title: 'Accent',
        icon: 'paintbrush',
        items: ['sage', 'clay', 'harbor'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withBrandTokens],
};

export default preview;
