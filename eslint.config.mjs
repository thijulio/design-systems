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
              onlyDependOnLibsWithTags: ['scope:core', 'scope:biome'],
            },
            // Professional design system (Exodus). Never imports biome, and vice versa.
            {
              sourceTag: 'scope:exodus',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:exodus'],
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
