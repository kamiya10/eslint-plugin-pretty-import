# sort-import-groups

Groups and sorts imports with CSS grouping at the bottom.

## Rule Details

This rule enforces a specific 6-group hierarchy for organizing imports:

1. **Built-ins** - `node:fs`, `bun:sqlite`, etc.
2. **External** - npm packages
3. **Local Patterns** - `@/utils`, `~/lib` (configured aliases)
4. **Local** - `./utils`, `../components`
5. **Namespace** - `import * as`
6. **Types** - `import type`

Additionally, it groups CSS imports (`.css`, `.scss`, `.sass`, `.less`) and
places them at the bottom, as CSS doesn't affect JavaScript code logic.

JavaScript side effects (`import 'polyfill'`) act as "rivers" that maintain
their original positions and separate import sections.

## Options

```typescript
{
  // Path aliases (default: [])
  localPatterns: string[];
  
  // Group CSS at bottom (default: true)
  groupStyleImports: boolean;
  
  // Built-in prefixes (default: ['node:', 'bun:'])
  builtinModulePrefixes: string[];
}
```

### Blank Line Rules

- Groups are separated by exactly one blank line
- No blank lines within groups  
- These rules are enforced automatically

## Examples

### ❌ Incorrect

```typescript
import { z } from 'zod';
import { ReadStream } from 'node:fs';
import './styles.css';
import assert from 'node:assert';
import { useState } from 'react';
import Button from './components/button';
```

### ✅ Correct

```typescript
import { ReadStream } from 'node:fs';
import assert from 'node:assert';

import { useState } from 'react'; 
import { z } from 'zod';

import Button from './components/button';

import './styles.css';
```

### With JavaScript Side Effects (Rivers)

```typescript
// Original
import { utils } from '@/utils';
import './reset.css';
import 'polyfill';  // JavaScript side effect
import './theme.css';
import { Component } from './component';

// After sorting
import { utils } from '@/utils';

import 'polyfill';  // JavaScript river stays in position

import { Component } from './component';

import './reset.css';  // CSS moved to bottom
import './theme.css';
```

### With Local Patterns

```json
{
  "pretty-import/sort-import-groups": ["error", {
    "localPatterns": ["@/", "~/", "#/"]
  }]
}
```

```typescript
import * as fs from 'node:fs';

import { useState } from 'react';
import axios from 'axios';

import { formatDate } from '@/utils/date';  // Local pattern
import { helpers } from '~/lib/helpers';    // Local pattern  

import Button from './components/button';   // Local relative

import type { User } from './types';        // Type import

import './styles.css';                      // CSS at bottom
```

## Integration with Other Rules

This rule is designed to work with:

- `separate-type-imports` - Runs first to convert inline type imports
- `sort-import-names` - Sorts named imports within each import statement

Use all three rules together for complete import organization:

```js
import prettyImport from '@kamiya4047/eslint-plugin-pretty-import';

export default [
  {
    plugins: { 'pretty-import': prettyImport },
    rules: {
      'pretty-import/separate-type-imports': 'error',  // Runs first
      'pretty-import/sort-import-groups': 'error',     // Then groups
      'pretty-import/sort-import-names': 'error'       // Finally sorts names
    }
  }
];
```

## When Not to Use

- If your project depends on CSS load order
- If you prefer different import grouping conventions
- If you want to keep CSS imports in their original positions

## Version

This rule was introduced in v2.0.0 as part of the modular rule architecture.
