import { test } from 'bun:test';

import { RuleTester } from 'eslint';

import parser from '@typescript-eslint/parser';

import { sortImportNames } from '@/rules/sort-import-names';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

test('sort-import-names rule', () => {
  ruleTester.run('sort-import-names', sortImportNames, {
    valid: [
      // Already sorted named imports
      {
        code: `import { a, b, c } from 'module';`,
      },

      // Single import (no sorting needed)
      {
        code: `import { single } from 'module';`,
      },

      // Default import only
      {
        code: `import React from 'react';`,
      },

      // Namespace import only
      {
        code: `import * as fs from 'fs';`,
      },

      // Side effect import (no specifiers)
      {
        code: `import './styles.css';`,
      },

      // Mixed default and named imports (sorted)
      {
        code: `import React, { useCallback, useEffect, useState } from 'react';`,
      },

      // Special characters sorted correctly
      {
        code: `import { $special, Component, helper } from 'module';`,
      },

      // Case-sensitive sorting (uppercase before lowercase)
      {
        code: `import { Component, helper } from 'module';`,
      },

      // With aliases (sorted by original name)
      {
        code: `import { a as alpha, b as beta, c as gamma } from 'module';`,
      },

      // Type imports are skipped (handled by separate-type-imports rule)
      {
        code: `import { type User, getValue } from 'module';`,
      },
    ],

    invalid: [
      // Basic unsorted imports
      {
        code: `import { c, a, b } from 'module';`,
        errors: [{ messageId: 'importNamesNotSorted' }],
        output: `import { a, b, c } from 'module';`,
      },

      // Mixed default and unsorted named imports
      {
        code: `import React, { useState, useCallback, useEffect } from 'react';`,
        errors: [{ messageId: 'importNamesNotSorted' }],
        output: `import React, { useCallback, useEffect, useState } from 'react';`,
      },

      // Special characters and case mixing
      {
        code: `import { helper, Component, $special } from 'module';`,
        errors: [{ messageId: 'importNamesNotSorted' }],
        output: `import { $special, Component, helper } from 'module';`,
      },

      // With aliases (should sort by original name)
      {
        code: `import { c as gamma, a as alpha, b as beta } from 'module';`,
        errors: [{ messageId: 'importNamesNotSorted' }],
        output: `import { a as alpha, b as beta, c as gamma } from 'module';`,
      },

      // Mixed aliases and regular imports
      {
        code: `import { z, a as alpha, b } from 'module';`,
        errors: [{ messageId: 'importNamesNotSorted' }],
        output: `import { a as alpha, b, z } from 'module';`,
      },

      // Type imports (should be sorted by original name)
      {
        code: `import type { User, Profile, Config } from 'types';`,
        errors: [{ messageId: 'importNamesNotSorted' }],
        output: `import type { Config, Profile, User } from 'types';`,
      },

      // Complex case with default, namespace would be handled but namespace imports don't get sorted with named
      {
        code: `import React, { useState, useCallback } from 'react';`,
        errors: [{ messageId: 'importNamesNotSorted' }],
        output: `import React, { useCallback, useState } from 'react';`,
      },
    ],
  });
});

test('sort-import-names rule with case-insensitive option', () => {
  const ruleTesterCaseInsensitive = new RuleTester({
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
  });

  ruleTesterCaseInsensitive.run('sort-import-names-case-insensitive', sortImportNames, {
    valid: [
      // Case-insensitive sorting
      {
        code: `import { Component, helper } from 'module';`,
        options: [{ caseInsensitive: true }],
      },
    ],

    invalid: [
      // Case-insensitive sorting should put 'c' before 'B'
      {
        code: `import { B, c, a } from 'module';`,
        options: [{ caseInsensitive: true }],
        errors: [{ messageId: 'importNamesNotSorted' }],
        output: `import { a, B, c } from 'module';`,
      },
    ],
  });
});
