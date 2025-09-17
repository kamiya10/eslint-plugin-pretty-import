import { defineConfig } from '@eslint/config-helpers';

import js from '@eslint/js';
import plugin from 'eslint-plugin-eslint-plugin';
import stylistic from '@stylistic/eslint-plugin';
import ts from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';

import prettyImport from './src/index';

export default defineConfig(
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**', 'example/**', 'test/**', '*.js'],
  },
  // Global files pattern
  {
    files: ['src/**/*.ts', '*.config.ts'],
  },
  // TypeScript parser configuration
  {
    files: ['src/**/*.ts', '*.config.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  js.configs.recommended,
  ts.configs.recommendedTypeChecked,
  ts.configs.stylisticTypeChecked,
  plugin.configs.recommended,
  prettyImport.configs.error,
  stylistic.configs.customize({
    arrowParens: true,
    semi: true,
  }),
);
