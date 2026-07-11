import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import type { StorybookConfig } from '@storybook/react-vite';

import { mergeConfig } from 'vite';
import react from '@vitejs/plugin-react';

const config: StorybookConfig = {
  stories: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: ['@storybook/addon-docs'],
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
