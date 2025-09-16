# sort-import-names

Sorts named imports within import statements alphabetically.

## Rule Details

This rule enforces alphabetical sorting of named imports within each import
statement, with support for case-insensitive sorting.

The rule uses the same character priority system as the main sorting algorithm:

1. Special characters (`$`, `_`, etc.)
2. UPPERCASE letters  
3. lowercase letters

## Options

```typescript
{
  // Case insensitive sorting (default: false)
  caseInsensitive: boolean;
}
```

## Examples

### ❌ Incorrect

```typescript
import { useState, useEffect, useMemo } from 'react';
import { ZodError, z, ZodSchema } from 'zod';
```

### ✅ Correct

```typescript
import { useEffect, useMemo, useState } from 'react';
import { z, ZodError, ZodSchema } from 'zod';
```

### Case Sensitive Sorting (Default)

```typescript
// Before
import { zeta, Alpha, beta } from './constants';

// After  
import { Alpha, beta, zeta } from './constants';
```

### Case Insensitive Sorting

```json
{
  "pretty-import/sort-import-names": ["error", { "caseInsensitive": true }]
}
```

```typescript
// Before
import { Zeta, alpha, Beta } from './constants';

// After
import { alpha, Beta, Zeta } from './constants';
```

### Character Priority Examples

```typescript
// Special characters → UPPERCASE → lowercase
import { $store, AUTH_TOKEN, apiClient } from './constants';
import { _private, PUBLIC_API, utils } from './helpers';
```

### Mixed Import Types

The rule handles different import specifier types correctly:

```typescript
// Default, namespace, and named imports
import defaultExport, * as namespace, { namedA, namedB } from './module';

// Only sorts the named imports part
import defaultExport, * as namespace, { namedA, namedB } from './module';
//                                     ^^^^^^^^^^^^^^^^^ sorted
```

### With Aliases

```typescript
// Before
import { longFunctionName as short, anotherFunction as af, basicFunction } from './utils';

// After (sorted by imported name, not alias)
import { anotherFunction as af, basicFunction, longFunctionName as short } from './utils';
```

## Integration with Other Rules

This rule is designed to work seamlessly with:

- `separate-type-imports` - Processes inline type imports first
- `sort-import-groups` - Organizes imports into groups

The recommended configuration uses all three rules:

```js
export default [
  {
    plugins: { 'pretty-import': prettyImport },
    rules: {
      'pretty-import/separate-type-imports': 'error',  // 1. Convert inline types
      'pretty-import/sort-import-groups': 'error',     // 2. Group imports  
      'pretty-import/sort-import-names': 'error'       // 3. Sort within imports
    }
  }
];
```

## Rule Behavior

### Skips Single Imports

The rule only applies to import statements with multiple specifiers:

```typescript
// No changes - single import
import { useState } from 'react';

// Gets sorted - multiple imports  
import { useState, useEffect, useMemo } from 'react';
```

### Skips Side Effect Imports

```typescript
// No changes - side effect import
import './styles.css';
import 'polyfill';
```

### Skips Inline Type Imports

When used with `separate-type-imports`, this rule automatically skips imports
that contain inline type imports, allowing the type separation to happen first:

```typescript
// This will be processed by separate-type-imports first
import { useState, type ComponentProps } from 'react';

// After separate-type-imports runs, sort-import-names processes the result
import { useState } from 'react';
import type { ComponentProps } from 'react';
```

## When Not to Use

- If you prefer a different sorting order (e.g., by usage frequency)
- If you want to maintain manual import organization  
- If you're using other import sorting tools that conflict

## Version

This rule was introduced in v2.0.0 as part of the modular rule architecture.
