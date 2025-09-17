import { sortImportGroups } from './rules/sort-import-groups';
import { sortImportNames } from './rules/sort-import-names';

import pkg from '../package.json';
import separateTypeImports from './rules/separate-type-imports';

import type { Linter } from 'eslint';

const plugin = {
  meta: {
    name: 'eslint-plugin-pretty-import',
    version: pkg.version,
  },

  rules: {
    'sort-import-groups': sortImportGroups,
    'sort-import-names': sortImportNames,
    'separate-type-imports': separateTypeImports,
  },

  configs: {} as Record<'warn' | 'error', Linter.Config>,
};

Object.assign(plugin.configs, {
  warn: {
    name: 'pretty-import/warn',
    plugins: {
      'pretty-import': plugin,
    },
    rules: {
      'pretty-import/separate-type-imports': 'error',
      'pretty-import/sort-import-groups': ['warn', {
        localPatterns: ['@/', '~/', '#/'],
        groupStyleImports: true,
        builtinModulePrefixes: ['node:', 'bun:', 'deno:'],
      }],
      'pretty-import/sort-import-names': 'warn',
    },
  },
  error: {
    name: 'pretty-import/error',
    plugins: {
      'pretty-import': plugin,
    },
    rules: {
      'pretty-import/separate-type-imports': 'error',
      'pretty-import/sort-import-groups': ['error', {
        localPatterns: ['@/', '~/', '#/'],
        groupStyleImports: true,
        builtinModulePrefixes: ['node:', 'bun:', 'deno:'],
      }],
      'pretty-import/sort-import-names': ['error', {
        caseInsensitive: false,
      }],
    },
  },
} as Record<'warn' | 'error', Linter.Config>);

export default plugin;
