import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import type { StorybookConfig } from '@storybook/react-vite';

import { mergeConfig } from 'vite';
import react from '@vitejs/plugin-react';

const config: StorybookConfig = {
  // Scoped to the Faune brand only — feeds the design-sync reference storybook
  // for the Faune Design System project (each brand has its own sync run). Keeps
  // other brands' stories out of the index so shared component names (Button, Card)
  // can't cross-pair against the faune bundle.
  stories: ['../src/faune/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  // Components are consumed as BUILT packages (dist/index.js + dist/index.css),
  // resolved via the workspace node_modules symlinks — not remapped to source —
  // so their CSS-Module classes match the bundled stylesheet.
  // react() must be present so JSX in story files is transformed before
  // Storybook's export-order lexer parses them.
  viteFinal: async (viteConfig) =>
    mergeConfig(viteConfig, { plugins: [react()] }),
};

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

export default config;
