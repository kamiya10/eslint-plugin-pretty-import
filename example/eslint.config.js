import prettyImport from '../dist/index.js';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'pretty-import': prettyImport
    },
    rules: {
      'pretty-import/sort-import-groups': ['error', {
        localPatterns: ['@/', '~/', '#/'],
        groupStyleImports: true,
        builtinModulePrefixes: ['node:', 'bun:', 'deno:']
      }],
      'pretty-import/sort-import-names': 'error',
      'pretty-import/separate-type-imports': 'error'
    }
  }
];
