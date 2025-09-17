# ESLint Plugin Pretty Import

![Build](https://github.com/kamiya4047/eslint-plugin-pretty-import/actions/workflows/build.yml/badge.svg)
![GitHub
License](https://img.shields.io/github/license/kamiya4047/eslint-plugin-pretty-import)
![NPM
Version](https://img.shields.io/npm/v/%40kamiya4047%2Feslint-plugin-pretty-import)

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
>
> This plugin might break your project. It moves CSS imports to the
> bottom which could affect load order. It uses non-standard sorting that your
> team might hate. It's definitely not for everyone. Actually, it's probably
> just for me and the three other people who think like me.

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

### Configuration

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
| [`sort-import-groups`] | Groups and sorts imports with CSS grouping | ✅ |
| [`sort-import-names`] | Sorts named imports within import statements | ✅ |
| [`separate-type-imports`] | Enforces separate `import type` declarations | ✅ |

## Example

Example file can be found at [`example`](https://github.com/kamiya4047/eslint-plugin-pretty-import/tree/main/example)

<details><summary>Before</summary>

```ts
import { z } from 'zod';
import { ReadStream, WriteStream } from 'node:fs';
import { produce } from 'immer';
import { TextDecoder, TextEncoder } from 'node:util';
import { createServer } from 'node:http';
import dayjs from 'dayjs';
import type { ReactNode, ReactElement, ComponentType } from 'react';
import path from 'node:path';
import crypto from 'node:crypto';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { BehaviorSubject, Observable } from 'rxjs';
import type { ParsedUrlQuery } from 'querystring';
import { readFile, access, writeFile } from 'node:fs/promises';
import './styles/global.css';
import { NextRequest, NextResponse } from 'next/server';
import './styles/fonts.css';
import assert from 'node:assert';
import 'dotenv/config';
import './styles/components.css';
import type { RequestPayload, ResponseData } from '@/lib/api';
import type { User, UserProfile } from '@/lib/api/users';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import Button from './components/button';
import { validateUser } from './utils/validation';
import { formatDate } from '@/utils/date';
import { LocalStorage, SessionStorage } from '@/utils/storage'
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { parseConfig } from './config/parser';
import type { ResolvingMetadata, Metadata } from 'next';
import { generateId } from './lib/id';
import { ApiClient, apiUtils } from './lib/api';
import { ErrorBoundary, ErrorFallback } from '@/components/error';
import AuthProvider from '@/providers/auth';
import AppLayout from './layouts/app';
```

</details>

<details><summary>After</summary>

```ts
import { access, readFile, writeFile } from 'node:fs/promises';
import { ReadStream, WriteStream } from 'node:fs';
import { TextDecoder, TextEncoder } from 'node:util';
import { createServer } from 'node:http';

import assert from 'node:assert';
import crypto from 'node:crypto';
import path from 'node:path';

import { BehaviorSubject, Observable } from 'rxjs';
import { NextRequest, NextResponse } from 'next/server';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { produce } from 'immer';
import { z } from 'zod';

import dayjs from 'dayjs';

import 'dotenv/config';

import { useEffect, useMemo, useState } from 'react';

import axios from 'axios';

import { ErrorBoundary, ErrorFallback } from '@/components/error';
import { LocalStorage, SessionStorage } from '@/utils/storage';
import { formatDate } from '@/utils/date';

import AuthProvider from '@/providers/auth';

import { ApiClient, apiUtils } from './lib/api';
import { generateId } from './lib/id';
import { parseConfig } from './config/parser';
import { validateUser } from './utils/validation';

import AppLayout from './layouts/app';
import Button from './components/button';

import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ComponentType, ReactElement, ReactNode } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import type { RequestPayload, ResponseData } from '@/lib/api';
import type { User, UserProfile } from '@/lib/api/users';

import './styles/global.css';
import './styles/fonts.css';
import './styles/components.css';
```

</details>

## Configuration Examples

### Custom Path Aliases

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

## The Philosophy

I've stared at a *lot* of import statements. After years of squinting at the top
of files, certain patterns just started to *feel* right:

- **Built-ins first** - Native/built-in modules should appear at the top of
   the file
- **Named import counts** - More imports first creates a visual triangle shape
  when sorted by count: `{a, b, c, d, e}` before `{z}`
- **CSS at the bottom** - Styles are makeup, logic is bone structure. Bone
  structure first
- **Preserve flow** - Side effects maintain their original position to
  preserve JavaScript execution order

Is this objectively correct? No. Is this how imports look best to me?
Absolutely.

## How It Works

### Sorting Process

1. **Group CSS** - Move all CSS imports to the bottom
2. **Split by side effects** - JavaScript side effects create section boundaries
   (type imports are ignored and don't create boundaries)
3. **Sort sections** - Apply 6-group hierarchy to each section
4. **Reconstruct** - Reassemble with side effects preserved and CSS at bottom

## Why This Specific Order Though?

### Style & Types Go Last

CSS imports mixed throughout the file disrupt the logical flow:

- JavaScript = core application logic
- CSS = visual presentation layer
- Logic should precede styling

Since CSS imports don't affect JavaScript execution, they can be grouped together
at the bottom while preserving their relative order.

Similarly, type imports (`import type`) are compile-time only and don't affect
runtime execution order. They're sorted freely across side effect boundaries,
grouped separately from runtime imports to maintain clean separation between
type definitions and executable code.

> [!NOTE]
>
> This could totally break your styles if you depend on CSS load order.
> But most projects don't, so... 🤷

### Triangle Shape

When first sorted by import count, it creates a satisfying visual triangle shape:

```javascript
import { useEffect, useMemo, useRef, useState } from 'react';
import { and, exists, isNotNull } from 'drizzle-orm';
import { create, useStore } from 'zustand'
import { type } from 'arktype';
import { z } from 'zod';
```

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

Contributions are welcome! Please read our
[Contributing Guide](.github/CONTRIBUTING.md) for details.

## License

License can be found at [LICENSE](LICENSE).

## Links

- [Documentation](docs/README.md)
- [Changelog](CHANGELOG.md)
- [GitHub Repository](https://github.com/kamiya4047/eslint-plugin-pretty-import)
- [NPM Package](https://www.npmjs.com/package/@kamiya4047/eslint-plugin-pretty-import)
- [GitHub Packages](https://github.com/kamiya4047/eslint-plugin-pretty-import/pkgs/npm/eslint-plugin-pretty-import)

## Support

If you find this plugin useful, consider supporting its development:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/kamiya4047)

[`sort-import-groups`]: https://github.com/kamiya4047/eslint-plugin-pretty-import/blob/main/docs/rules/sort-import-groups.md
[`sort-import-names`]: https://github.com/kamiya4047/eslint-plugin-pretty-import/blob/main/docs/rules/sort-import-names.md
[`separate-type-imports`]: https://github.com/kamiya4047/eslint-plugin-pretty-import/blob/main/docs/rules/separate-type-imports.md
