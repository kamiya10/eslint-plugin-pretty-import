import { test } from 'bun:test';

import { RuleTester } from 'eslint';

import parser from '@typescript-eslint/parser';

import { sortImportGroups } from '@/rules/sort-import-groups';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

test('sort-import-groups rule', () => {
  ruleTester.run('sort-import-groups', sortImportGroups, {
    valid: [
      // Single import (no grouping needed)
      {
        code: `import React from 'react';`,
      },

      // Side effect imports maintain their position
      {
        code: `
import 'polyfill';

import React from 'react';

import './setup';

import { helper } from './utils';
        `.trim(),
      },
    ],

    invalid: [
      // Basic grouping issue - external before builtin
      {
        code: `
import React from 'react';
import { readFile } from 'node:fs';
        `.trim(),
        errors: [{ messageId: 'importGroupsNotSorted' }],
        output: `
import { readFile } from 'node:fs';

import React from 'react';
        `.trim(),
      },
    ],
  });
});

test('sort-import-groups rule with blank line validation', () => {
  const ruleTesterBlankLines = new RuleTester({
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
  });

  ruleTesterBlankLines.run('sort-import-groups-blank-lines', sortImportGroups, {
    valid: [
      // Correct blank lines between groups
      {
        code: `
import { readFile } from 'node:fs';

import React from 'react';

import { config } from './config';
        `.trim(),
      },
    ],

    invalid: [
      // Missing blank line between groups
      {
        code: `
import { readFile } from 'node:fs';
import React from 'react';
        `.trim(),
        errors: [{ messageId: 'missingBlankLine' }],
        output: `
import { readFile } from 'node:fs';

import React from 'react';
        `.trim(),
      },

      // Extra blank lines within same group
      {
        code: `
import React from 'react';

import lodash from 'lodash';
        `.trim(),
        errors: [{ messageId: 'unexpectedBlankLine' }],
        output: `
import React from 'react';
import lodash from 'lodash';
        `.trim(),
      },
    ],
  });
});
