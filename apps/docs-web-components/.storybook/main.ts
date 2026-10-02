import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import type { StorybookConfig } from '@storybook/web-components-vite';

// Web Components catalog (ADR-0001). Composed into the React host Storybook
// (apps/docs) via `refs`; consumes the BUILT element packages.
const config: StorybookConfig = {
  stories: ['../src/**/*.@(mdx|stories.@(js|ts))'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: getAbsolutePath('@storybook/web-components-vite'),
    options: {},
  },
};

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

export default config;
