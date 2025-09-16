import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true
  },
  external: [
    '@typescript-eslint/types',
    '@typescript-eslint/utils',
    'eslint'
  ],
  plugins: [
    json(),
    typescript({
      tsconfig: './tsconfig.json'
    })
  ]
};