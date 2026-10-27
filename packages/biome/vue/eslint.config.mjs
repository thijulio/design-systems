import vue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';
import tsParser from '@typescript-eslint/parser';
import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
  },
  {
    // Component names mirror biome-react (Button, Card, Tag), which are
    // single words; the `@thijulio/biome-vue` import path namespaces them.
    files: ['**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  // Prettier owns formatting; turn off the stylistic rules it would fight.
  prettier,
];
