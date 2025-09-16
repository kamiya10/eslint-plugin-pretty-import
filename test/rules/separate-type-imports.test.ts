import { test } from 'bun:test';

import { RuleTester } from 'eslint';

import parser from '@typescript-eslint/parser';

import rule from '@/rules/separate-type-imports';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

test('separate-type-imports rule', () => {
  ruleTester.run('separate-type-imports', rule, {
    valid: [
      // Already separated type imports
      {
        code: `
import React from 'react';
import type { ComponentProps } from 'react';
        `,
      },

      // Pure value imports
      {
        code: `
import { useState, useEffect } from 'react';
        `,
      },

      // Pure type imports
      {
        code: `
import type { User, Profile } from './types';
        `,
      },
    ],

    invalid: [
      // Inline type imports (types only)
      {
        code: `
import { type User, type Profile } from './types';
        `,
        errors: [{ messageId: 'separateTypeImport' }],
        output: `
import type { User, Profile } from './types';
        `,
      },

      // Mixed imports
      {
        code: `
import { useState, type ComponentProps, useEffect } from 'react';
        `,
        errors: [{ messageId: 'mixedImport' }],
        output: `
import type { ComponentProps } from 'react';
import { useState, useEffect } from 'react';
        `,
      },

      // Complex mixed imports (with default import)
      {
        code: `
import React, { useState, type ComponentProps, useEffect } from 'react';
        `,
        errors: [{ messageId: 'mixedImport' }],
        output: `
import type { ComponentProps } from 'react';
import React, { useState, useEffect } from 'react';
        `,
      },

      // Mixed imports (with namespace import)
      {
        code: `
import { type ComponentProps, useState } from 'react';
        `,
        errors: [{ messageId: 'mixedImport' }],
        output: `
import type { ComponentProps } from 'react';
import { useState } from 'react';
        `,
      },

      // Multiple type imports mixed with value imports
      {
        code: `
import { type User, type Profile, getName, type Settings, getAge } from './utils';
        `,
        errors: [{ messageId: 'mixedImport' }],
        output: `
import type { User, Profile, Settings } from './utils';
import { getName, getAge } from './utils';
        `,
      },

      // Type imports with aliases
      {
        code: `
import { type User as UserType, getName } from './utils';
        `,
        errors: [{ messageId: 'mixedImport' }],
        output: `
import type { User as UserType } from './utils';
import { getName } from './utils';
        `,
      },
    ],
  });
});
