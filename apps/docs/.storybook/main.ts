import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import type { StorybookConfig } from '@storybook/react-vite';
import { logger } from 'storybook/internal/node-logger';

import { mergeConfig } from 'vite';
import react from '@vitejs/plugin-react';

const WEB_COMPONENTS_REF_URL = 'http://localhost:6007';
// Covers a cold start of both Storybooks launched together (~30–50s locally).
const REF_WAIT_MS = 90_000;

const config: StorybookConfig = {
  stories: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  // Storybook Composition (ADR-0001): the Web Components catalog runs as its
  // own Storybook (apps/docs-web-components, port 6007). Only composed in
  // development until the Pages workflow publishes that build too.
  refs: async (
    _config,
    { configType },
  ): Promise<Record<string, { title: string; url: string }>> => {
    if (configType !== 'DEVELOPMENT') return {};
    if (!(await waitForRef(WEB_COMPONENTS_REF_URL, REF_WAIT_MS))) {
      logger.warn(
        `${WEB_COMPONENTS_REF_URL} (Web Components Storybook) did not respond ` +
          `within ${REF_WAIT_MS / 1000}s, so it is not composed. Start ` +
          '`nx storybook docs-web-components`, then restart this Storybook.',
      );
      return {};
    }
    return {
      'web-components': {
        title: 'Web Components',
        url: WEB_COMPONENTS_REF_URL,
      },
    };
  },
  // Components are consumed as BUILT packages (dist/index.js + dist/index.css),
  // resolved via the workspace node_modules symlinks — not remapped to source —
  // so their CSS-Module classes match the bundled stylesheet.
  // react() must be present so JSX in story files is transformed before
  // Storybook's export-order lexer parses them.
  viteFinal: async (viteConfig) =>
    mergeConfig(viteConfig, { plugins: [react()] }),
};

// Storybook probes each ref ONCE at boot (server-side GET <url>/iframe.html).
// Reachable → the browser fetches the ref's index.json without credentials.
// Unreachable → `credentials: 'include'`, which the ref's dev server
// (`Access-Control-Allow-Origin: *`) can't satisfy, so the sidebar shows
// "Loading of ref failed … CORS error" until this Storybook restarts. Waiting
// for the ref makes the start order of the two Storybooks irrelevant.
async function waitForRef(url: string, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  let announced = false;
  for (;;) {
    try {
      const res = await fetch(`${url}/iframe.html`, {
        signal: AbortSignal.timeout(5_000),
      });
      if (res.ok) return true;
    } catch {
      // Not listening yet (or timed out) — retry until the deadline.
    }
    if (Date.now() >= deadline) return false;
    if (!announced) {
      // Keep the URL followed by a space: the logger linkifies it greedily.
      logger.info(`Waiting for ${url} (Web Components Storybook) to respond`);
      announced = true;
    }
    await sleep(1_000);
  }
}

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

export default config;
