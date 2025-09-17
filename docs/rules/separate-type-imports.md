# separate-type-imports

Enforces the use of separate `import type` declarations instead of inline type
imports for improved code clarity and build optimization.

## Rule Details

This rule enforces consistent usage of TypeScript's `import type` syntax for
importing types, preventing the mixing of type and value imports within the same
statement. It automatically converts inline type imports to separate
declarations.

The rule provides automatic fixes by:

1. Converting inline type imports to separate `import type` statements
2. Splitting mixed import statements into distinct type and value imports
3. Preserving import aliases and maintaining proper syntax

## Examples

### ❌ Incorrect

```typescript
// Inline type imports mixed with values
import { useState, type ComponentProps, useEffect } from 'react';

// Type-only imports using regular import syntax
import { type User, type Profile } from './types';

// Mixed default and inline type imports
import React, { type FC, useState } from 'react';

// Type import with alias mixed with values
import { type User as UserType, getName } from './utils';
```

### ✅ Correct

```typescript
// Separate type and value imports
import { useState, useEffect } from 'react';
import type { ComponentProps } from 'react';

// Pure type imports using import type
import type { User, Profile } from './types';

// Separate default, value, and type imports
import React, { useState } from 'react';
import type { FC } from 'react';

// Separate type import with alias
import { getName } from './utils';
import type { User as UserType } from './utils';
```

## Benefits and Rationale

### Code Clarity

- **Explicit Intent**: Clearly distinguishes between runtime dependencies and
  compile-time type dependencies
- **Easier Maintenance**: Developers can immediately identify which imports are
  used only for typing
- **Consistent Patterns**: Establishes uniform import conventions across the
  codebase

### Build Optimization

- **Bundle Size**: Bundlers can more effectively eliminate type-only imports
  during tree-shaking
- **Compilation Speed**: TypeScript compiler can optimize type-only imports for
  faster builds
- **Type Erasure**: Makes TypeScript's type erasure process more explicit and
  predictable

### Development Experience

- **IDE Support**: Better IntelliSense and refactoring support when types are
  clearly separated
- **Dependency Analysis**: Tools can more accurately analyze runtime vs.
  compile-time dependencies
- **Code Reviews**: Easier to review changes that affect only types vs. runtime
  behavior

## Automatic Fixing

This rule provides comprehensive automatic fixing:

### Converting Inline Type Imports

```typescript
// Before
import { useState, type FC } from 'react';

// After
import { useState } from 'react';
import type { FC } from 'react';
```

### Splitting Mixed Imports

```typescript
// Before
import React, { useState, type ComponentProps } from 'react';

// After
import React, { useState } from 'react';
import type { ComponentProps } from 'react';
```

### Preserving Aliases

```typescript
// Before
import { getValue, type User as UserType } from './utils';

// After
import { getValue } from './utils';
import type { User as UserType } from './utils';
```

### Handling Multiple Types

```typescript
// Before
import { api, type User, type Profile, helper } from './services';

// After
import { api, helper } from './services';
import type { User, Profile } from './services';
```

## Edge Cases and Special Scenarios

### Default Type Imports

```typescript
// Already correct - default type import
import type React from 'react';

// Will be flagged and fixed
import { type default as React } from 'react';
// Fixed to:
import type { default as React } from 'react';
```

### Namespace Imports

```typescript
// Type-only namespace imports remain unchanged
import type * as Types from './types';

// Mixed namespace imports (rare but handled)
import * as Utils, { type Config } from './utils';
// Would be appropriately split
```

### Re-export Statements

This rule does not modify re-export statements:

```typescript
// These remain unchanged
export { type User } from './types';
export type { User } from './types';
```

### Dynamic Imports

Dynamic imports are not affected by this rule:

```typescript
// These remain unchanged
const module = await import('./module');
const types = await import('./types');
```

## When Not to Use This Rule

Consider disabling this rule if:

- **Legacy Compatibility**: Your project uses TypeScript versions older than 3.8
- **Team Preference**: Your team explicitly prefers inline type imports for
  brevity
- **Tool Constraints**: You're using tools that specifically require inline type
  imports
- **Migration Overhead**: The codebase is too large to migrate all at once

## TypeScript Configuration

### Compatibility Requirements

- **TypeScript**: Version 3.8 or higher (for `import type` syntax support)
- **Parser**: Requires `@typescript-eslint/parser` for TypeScript parsing

### ESLint Configuration

To use this rule, you must configure ESLint to use the TypeScript parser. For
more information about setting up typed linting, see the [TypeScript ESLint
documentation](https://typescript-eslint.io/getting-started/typed-linting).

```javascript
// eslint.config.js
import prettyImport from '@kamiya4047/eslint-plugin-pretty-import';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'pretty-import': prettyImport
    },
    rules: {
      'pretty-import/separate-type-imports': 'error'
    }
  }
];
```

For legacy `.eslintrc` configuration:

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@kamiya4047/pretty-import"],
  "rules": {
    "pretty-import/separate-type-imports": "error"
  }
}
```

### TypeScript Compiler Options

For optimal results, consider these TypeScript compiler options:

```json
{
  "compilerOptions": {
    "importsNotUsedAsValues": "error",
    "preserveValueImports": true,
    "isolatedModules": true
  }
}
```

These options work synergistically with this ESLint rule to ensure proper type
import handling.
