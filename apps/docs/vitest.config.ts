import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

import {
  DEFAULT_DESIGN_SYSTEM,
  DESIGN_SYSTEM_GLOBAL,
  DESIGN_SYSTEMS,
  type DesignSystem,
} from './.storybook/design-system';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// One browser project per design system in the picker, each pinning the
// `designSystem` global the picker sets, so shared `Components/…` stories (and
// their axe gate) run under every brand's tokens. Branded stories ignore that
// global (their title names the brand), so only the default design system's
// project runs them; the others would repeat the same render. The projects
// run one after another (`groupOrder`): together they would triple the load on
// the orchestrator thread and starve hover interactions (see AGENTS.md).
const BRANDED_STORY_DIRS = DESIGN_SYSTEMS.map(
  (ds) => `**/src/${ds.toLowerCase()}/**`,
);

function storybookProject(designSystem: DesignSystem, order: number) {
  const isDefault = designSystem === DEFAULT_DESIGN_SYSTEM;
  return {
    extends: true,
    plugins: [
      storybookTest({
        configDir: path.join(dirname, '.storybook'),
        initialGlobals: { [DESIGN_SYSTEM_GLOBAL]: designSystem },
      }),
    ],
    test: {
      name: `storybook:${designSystem.toLowerCase()}`,
      exclude: isDefault ? [] : BRANDED_STORY_DIRS,
      sequence: { groupOrder: order },
      // Test files share one page per browser worker instead of a fresh
      // iframe each, so Vite serves the module graph once per worker, not
      // once per file: the run drops from ~95s to ~40s (#30). Re-serving it
      // per file saturated the orchestrator thread. Stories therefore start
      // on the page the previous file left: preview.tsx re-applies the
      // brand CSS and data-mode/data-theme on every story and stamps its id,
      // and checks of that state wait for it (_test/legacy-styles.ts).
      isolate: false,
      // Axe audits execute in a real browser and can exceed Vitest's short
      // unit-test default while the full catalog is running concurrently.
      testTimeout: 30_000,
      browser: {
        enabled: true,
        headless: true,
        provider: playwright({}),
        instances: [{ browser: 'chromium' as const }],
      },
    },
  };
}

// Runs every story as a test: mounts it in a real (headless chromium) browser
// and executes its `play` interaction test. See .storybook for the story config.
// https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        // Pure catalog/model logic: plain node, no browser.
        test: {
          name: 'unit',
          root: dirname,
          include: ['src/**/*.spec.ts', '.storybook/**/*.spec.ts'],
          environment: 'node',
        },
      },
      ...DESIGN_SYSTEMS.map(storybookProject),
    ],
  },
});
