# ESLint Plugin Pretty Import

The import sorting plugin that does it *my way*. After years of being mildly
annoyed by other sorting plugins, I finally wrote one that makes imports look
exactly how I want them.

## Features

- **Opinionated 6-Group Hierarchy** - My preferred way of organizing imports
- **CSS Groups** - Moves CSS to bottom (⚠️ might break your styles!)
- **River-Based Side Effects** - Preserves JS execution order (the only
  non-negotiable part)
- **Count-Based Sorting** - Busier imports get priority (weird, but I like it)
- **Character Priority** - Creates visual hierarchy I find pleasing
- **Full ESLint v9 Support** - Built for flat config format

## Why This Plugin Exists

I've tried a lot of import sorting plugins and none of them fit my preference.

So I built my own. This plugin is **unapologetically opinionated** – it sorts
imports exactly the way I think they should look after years of staring at code.
It's not based on any standard or committee decision. It's based on what makes
my brain happy when I open a file.

> [!WARNING]
> This plugin might break your project. It moves CSS imports to the
> bottom which could affect load order. It uses non-standard sorting that your
> team might hate. It's definitely not for everyone. Actually, it's probably just
> for me and the three other people who think like me.

You might hate it. That's cool! But if you've also been searching for that *just
right* import order, maybe we share the same aesthetic.

## Quick Start

### Installation

```bash
npm install --save-dev @kamiya4047/eslint-plugin-pretty-import
# or
yarn add --dev @kamiya4047/eslint-plugin-pretty-import
# or
bun add --dev @kamiya4047/eslint-plugin-pretty-import
```

From GitHub Packages:

```bash
npm install --save-dev @kamiya4047/eslint-plugin-pretty-import --registry=https://npm.pkg.github.com
```

### Basic Configuration

```js
// eslint.config.js
import prettyImport from '@kamiya4047/eslint-plugin-pretty-import';

export default [
  {
    plugins: { 'pretty-import': prettyImport },
    rules: {
      'pretty-import/separate-type-imports': 'error',
      'pretty-import/sort-import-groups': ['error', {
        localPatterns: ['@/', '~/'],
        groupStyleImports: true,
      }],
      'pretty-import/sort-import-names': 'error',
    }
  }
];
```

...or use Shared configurations:

```js
// eslint.config.js
import prettyImport from '@kamiya4047/eslint-plugin-pretty-import';

export default [
  // Warn (warn severity for sorting rules)
  prettyImport.configs.warn,
  
  // Or error (error severity with advanced options)
  prettyImport.configs.error,
];
```

## Rules

| Rule | Description | Fixable |
|------|-------------|---------|
| [`sort-import-groups`](#rule-sort-import-groups) | Groups and sorts imports with CSS grouping | ✅ |
| [`sort-import-names`](#rule-sort-import-names) | Sorts named imports within import statements | ✅ |
| [`separate-type-imports`](#rule-separate-type-imports) | Enforces separate `import type` declarations | ✅ |

## Rule: `sort-import-groups`

The main rule for organizing imports into groups and sorts them.

- Groups are
- Groups are separated by exactly one blank line
- No blank lines within groups

### Options

```typescript
{
  // Path aliases like ['@/', '~/']
  localPatterns: string[];
  
  // Group CSS at bottom (default: true)
  groupStyleImports: boolean;
  
  // Built-in prefixes (default: ['node:', 'bun:'])
  builtinModulePrefixes: string[];
}
```

## Rule: `sort-import-names`

Sorts the named imports within each import statement.

### Options

```typescript
{
  // Case insensitive sorting (default: false)
  caseInsensitive: boolean;
}
```

**Before:**

```typescript
import { useState, useEffect, useMemo } from 'react';
```

**After:**

```typescript
import { useEffect, useMemo, useState } from 'react';
```

## Rule: `separate-type-imports`

Enforces separation of type imports from value imports. This rule runs **first**
to prepare imports for the sorting rules.

**Before:**

```typescript
import { useState, type ComponentProps, type FC } from 'react';
import { type User, createUser } from './user';
```

**After:**

```typescript
import { useState } from 'react';
import type { ComponentProps, FC } from 'react';
import { createUser } from './user';
import type { User } from './user';
```

### How It Works with Other Rules

This rule is designed to work seamlessly with the sorting rules:

1. **separate-type-imports** runs first and converts inline `type` imports
2. **sort-import-groups** then organizes everything into proper groups  
3. **sort-import-names** finally sorts named imports alphabetically

All three rules can be used together without conflicts.

## Advanced Examples

### Multiple Named Imports (Count-Based Sorting)

Imports with more specifiers come first within their group:

```typescript
// More imports (3) come before fewer imports (1)
import { useEffect, useMemo, useState } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';
import { z } from 'zod';
```

### River System with CSS Grouping

```typescript
// Original
import { utils } from '@/utils';
import './reset.css';
import 'polyfill';
import './theme.css';
import { Component } from './component';

// After sorting
import { utils } from '@/utils';

import 'polyfill';  // JavaScript river stays

import { Component } from './component';

import './reset.css';  // CSS moved to bottom
import './theme.css';
```

### Character Priority in Alphabetical Sorting

```typescript
// Special characters → UPPERCASE → lowercase
import { $store, AUTH_TOKEN, apiClient } from './constants';
```

## Configuration Examples

### Next.js Project

```js
export default [
  {
    plugins: { 'pretty-import': prettyImport },
    rules: {
      'pretty-import/separate-type-imports': 'error',
      'pretty-import/sort-import-groups': ['error', {
        localPatterns: ['@/', '~/'],
        groupStyleImports: true
      }],
      'pretty-import/sort-import-names': 'error'
    }
  }
];
```

### Monorepo with Custom Aliases

```js
export default [
  {
    plugins: { 'pretty-import': prettyImport },
    rules: {
      'pretty-import/separate-type-imports': 'error',
      'pretty-import/sort-import-groups': ['error', {
        localPatterns: ['@app/', '@packages/', '@shared/'],
        builtinModulePrefixes: ['node:', 'bun:', 'deno:'],
        groupStyleImports: true
      }],
      'pretty-import/sort-import-names': 'error'
    }
  }
];
```

### Preset Configurations

```js
export default [
  // Warn: warn severity for sorting rules
  prettyImport.configs.warn,
  
  // Error: error severity with additional options
  prettyImport.configs.error,
];
```

## The Philosophy (Or: Why These Weird Rules?)

Look, I've stared at a *lot* of import statements. After years of squinting at
the top of files, certain patterns just started to *feel* right:

- **Built-ins first** - I want to know what runtime stuff you're using before
  anything else
- **Named import counts** - More imports first creates a visual triangle shape
  when sorted by count: `{a, b, c, d, e}` before `{z}`
- **CSS at the bottom** - Styles are makeup, logic is bone structure. Bone
  structure first
- **Rivers preserve flow** - Side effects stay where you put them because
  breaking things is bad

Is this objectively correct? No. Is this how imports look best to me?
Absolutely.

## How It Works

### Sorting Process

1. **Group CSS** - Move all CSS imports to the bottom
2. **Split by rivers** - JavaScript side effects create section boundaries
3. **Sort sections** - Apply 6-group hierarchy to each section
4. **Reconstruct** - Reassemble with rivers preserved and CSS at bottom

## Why This Specific Order Though?

### CSS Goes Last – Fight Me

CSS at the top of a file is like wearing your shirt before your underwear. Sure,
it works, but it feels wrong:

- JavaScript = the actual logic that runs
- CSS = the pretty colors
- Logic before beauty, always

**Note**: This could totally break your styles if you depend on CSS load order.
But my projects don't, so... 🤷

### More Imports = More Important

When sorted by import count, it creates a satisfying visual triangle shape:

```javascript
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { combineLatest, fromEvent, map, startWith } from 'rxjs';
import { clsx, twMerge } from 'tailwind-merge';
import { z } from 'zod';
```

This triangle pattern just *feels* right – more important imports get visual priority.

## Compatibility

- **ESLint**: v8.0.0 or higher (v9 recommended)
- **Node.js**: v18.0.0 or higher
- **TypeScript**: Full support with proper type imports handling

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build

# Lint
bun run lint
```

## Contributing

Contributions are welcome! Please read our [Contributing
Guide](.github/CONTRIBUTING.md) for details.

## License

License can be found at [LICENSE].

## Links

- [Documentation](docs/README.md)
- [Changelog](CHANGELOG.md)
- [GitHub Repository](https://github.com/kamiya4047/eslint-plugin-pretty-import)
- [NPM Package](https://www.npmjs.com/package/@kamiya4047/eslint-plugin-pretty-import)
- [GitHub Packages](https://github.com/kamiya4047/eslint-plugin-pretty-import/pkgs/npm/eslint-plugin-pretty-import)

## Support

If you find this plugin useful, consider supporting its development:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/kamiya4047)
