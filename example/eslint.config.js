import prettyImport from '../dist/index.js';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'pretty-import': prettyImport
    },
    rules: {
      'pretty-import/sort-imports': 'error',
      'pretty-import/separate-type-imports': 'error'
    }
  },
  
  prettyImport.configs.recommended,
  
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'pretty-import': prettyImport
    },
    rules: {
      'pretty-import/sort-imports': ['error', {
        localPatterns: ['@/', '~/', '#/'],
        builtinModulePrefixes: ['node:', 'bun:', 'deno:'],
        enforceBlankLines: true,
        separateTypeImports: true
      }],
      'pretty-import/separate-type-imports': 'error'
    }
  }
];
