import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/storybook-static',
      '**/vite.config.*.timestamp*',
    ],
  },
  {
    // Stencil compiles JSX to its `h` factory, which ESLint can't see as used.
    files: ['packages/primitives-web-components/src/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { varsIgnorePattern: '^h$' },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // Shared build tooling — depends on nothing brand-specific.
            {
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: ['scope:core'],
            },
            // Brand-agnostic UI primitives, styled against the --ds-* contract.
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            // Personal / website design system.
            {
              sourceTag: 'scope:biome',
              onlyDependOnLibsWithTags: [
                'scope:core',
                'scope:shared',
                'scope:biome',
              ],
            },
            // Exodus can consume shared primitives, but never another brand.
            {
              sourceTag: 'scope:exodus',
              onlyDependOnLibsWithTags: [
                'scope:core',
                'scope:shared',
                'scope:exodus',
              ],
            },
            // Faune — the warm, founder-led cat-sitting brand. Builds on the shared contract + primitives.
            {
              sourceTag: 'scope:faune',
              onlyDependOnLibsWithTags: [
                'scope:core',
                'scope:shared',
                'scope:faune',
              ],
            },
            // Docs (Storybook) is the one place all brands are consumed together.
            {
              sourceTag: 'scope:docs',
              onlyDependOnLibsWithTags: [
                'scope:core',
                'scope:shared',
                'scope:biome',
                'scope:exodus',
                'scope:faune',
                'scope:docs',
              ],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
