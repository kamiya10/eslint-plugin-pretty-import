# Documentation

This directory contains comprehensive documentation for all rules provided by
`eslint-plugin-pretty-import`.

## Available Rules

### Import Organization

- [`sort-import-groups`](./rules/sort-import-groups.md) - Groups and sorts
  imports with CSS extraction
- [`sort-import-names`](./rules/sort-import-names.md) - Sorts named imports
  within import statements
- [`separate-type-imports`](./rules/separate-type-imports.md) - Enforces
  separate `import type` declarations over inline type imports

## Quick Reference

| Rule | Description | Auto-fixable | Default Severity |
|------|-------------|--------------|------------------|
| [`sort-import-groups`](./rules/sort-import-groups.md) | Groups and sorts imports with CSS extraction | ✅ | `error` |
| [`sort-import-names`](./rules/sort-import-names.md) | Sorts named imports within import statements | ✅ | `error` |
| [`separate-type-imports`](./rules/separate-type-imports.md) | Enforces separate `import type` declarations | ✅ | `error` |

## Configuration Examples

### Basic Setup (Modular - Recommended)

```js
// eslint.config.js
import prettyImport from 'eslint-plugin-pretty-import';

export default [
  {
    plugins: {
      'pretty-import': prettyImport
    },
    rules: {
      'pretty-import/separate-type-imports': 'error',
      'pretty-import/sort-import-groups': 'error',
      'pretty-import/sort-import-names': 'error'
    }
  }
];
```

### Using Preset Configurations

```js
// eslint.config.js
import prettyImport from 'eslint-plugin-pretty-import';

export default [
  // Recommended: warn severity for sorting rules
  prettyImport.configs.recommended,
  
  // Or strict: error severity with advanced options
  prettyImport.configs.strict
];
```

### Advanced Configuration

```js
// eslint.config.js
import prettyImport from 'eslint-plugin-pretty-import';

export default [
  {
    plugins: {
      'pretty-import': prettyImport
    },
    rules: {
      'pretty-import/separate-type-imports': 'error',
      'pretty-import/sort-import-groups': ['error', {
        localPatterns: ['@/', '~/', '#/'],
        builtinModulePrefixes: ['node:', 'bun:', 'deno:'],
        groupStyleImports: true
      }],
      'pretty-import/sort-import-names': ['error', {
        caseInsensitive: false
      }]
    }
  }
];
```

## Integration Guides

### Working with Prettier

This plugin is fully compatible with Prettier. For optimal results, run ESLint
after Prettier to ensure import organization doesn't conflict with code
formatting:

```json
{
  "scripts": {
    "format": "prettier --write .",
    "lint": "eslint --fix .",
    "format-and-lint": "prettier --write . && eslint --fix ."
  }
}
```

### TypeScript

For TypeScript projects, ensure you're using the TypeScript ESLint parser:

```js
// eslint.config.js
import prettyImport from 'eslint-plugin-pretty-import';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser
    },
    plugins: {
      'pretty-import': prettyImport
    },
    rules: {
      'pretty-import/separate-type-imports': 'error',
      'pretty-import/sort-import-groups': 'error',
      'pretty-import/sort-import-names': 'error'
    }
  }
];
```

### Path Aliases Configuration

Configure `localPatterns` to match your TypeScript path mapping configuration:

```js
// If your tsconfig.json contains:
// {
//   "compilerOptions": {
//     "paths": {
//       "@/*": ["./src/*"],
//       "~/*": ["./lib/*"],
//       "#/*": ["./types/*"]
//     }
//   }
// }

export default [
  {
    rules: {
      'pretty-import/separate-type-imports': 'error',
      'pretty-import/sort-import-groups': ['error', {
        localPatterns: ['@/', '~/', '#/']
      }],
      'pretty-import/sort-import-names': 'error'
    }
  }
];
```

### IDE Integration

Most modern IDEs support ESLint auto-fixing on save:

#### VS Code

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

#### WebStorm/IntelliJ

- Enable "ESLint" in Settings → Languages & Frameworks → JavaScript → Code
  Quality Tools
- Check "Run eslint --fix on save"

## Performance Optimization

For optimal performance in large projects:

- **Use file patterns**: Target specific directories or file types
- **Enable caching**: Use `--cache` flag to avoid re-processing unchanged files
- **Parallel processing**: ESLint automatically uses available CPU cores
- **IDE integration**: Configure auto-fix on save for immediate feedback
