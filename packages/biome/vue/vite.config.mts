/// <reference types='vitest' />
import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import * as path from 'path';

/**
 * `./styles.css` is the one stylesheet a consumer imports: biome-css (fonts,
 * tokens, reset) followed by the component styles. The `@import` is added
 * after Vite has processed the CSS, so biome-css stays a dependency resolved
 * by the consumer's bundler instead of being inlined (and its fonts copied).
 */
function prependBiomeCss(): Plugin {
  return {
    name: 'biome-vue:prepend-biome-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const css = bundle['index.css'];
      if (css?.type !== 'asset') {
        this.error('expected the build to emit dist/index.css');
      }
      css.source = `@import '@thijulio/biome-css/biome.css';\n${css.source}`;
    },
  };
}

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/packages/biome/vue',
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(import.meta.dirname, 'tsconfig.lib.json'),
    }),
    prependBiomeCss(),
  ],
  // Configuration for building your library.
  // See: https://vite.dev/guide/build.html#library-mode
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    lib: {
      entry: 'src/index.ts',
      name: 'biome-vue',
      fileName: 'index',
      cssFileName: 'index',
      formats: ['es' as const],
    },
    rolldownOptions: {
      // One output module per source file: a consumer importing one component
      // drops every other component module via package.json `sideEffects`.
      // CSS still ships as the single `dist/index.css` (`./styles.css`), and
      // no JS module imports it.
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        // Mirror src (`lib/Name/Name.vue.js`) instead of lib mode's
        // `fileName` on every module (`index1.js`, `index2.js`, …). The CSS
        // Modules class maps of the shared stylesheets (`<style module src>`
        // into primitives and biome-react, ADR-0002) live outside src, so
        // they go under `_styles/` instead of `primitives/src/lib/…`.
        // A function gets the raw module id, so the `?vue&type=…` query is
        // flattened here as `[name]` would (`Name.vue_vue_type_…`).
        entryFileNames: ({ name }) =>
          `${name
            .replace(/^primitives\/src\/lib\//, '_styles/primitives/')
            .replace(/^biome\/react\/src\/lib\//, '_styles/biome-react/')
            .replace(/[?&=]/g, '_')}.js`,
      },
      // External packages that should not be bundled into your library.
      external: ['vue'],
    },
  },
  test: {
    name: 'biome-vue',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.ts'],
    reporters: ['default'],
  },
}));
