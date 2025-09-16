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
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});

test('separate-type-imports rule', () => {
  ruleTester.run('separate-type-imports', rule, {
    valid: [
      // 已經分離的類型導入
      {
        code: `
import React from 'react';
import type { ComponentProps } from 'react';
        `,
      },

      // 純值導入
      {
        code: `
import { useState, useEffect } from 'react';
        `,
      },

      // 純類型導入
      {
        code: `
import type { User, Profile } from './types';
        `,
      },
    ],

    invalid: [
      // 內聯類型導入（僅類型）
      {
        code: `
import { type User, type Profile } from './types';
        `,
        errors: [{ messageId: 'separateTypeImport' }],
        output: `
import type { User, Profile } from './types';
        `,
      },

      // 混合導入
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

      // 複雜混合導入（包含默認導入）
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

      // 混合導入（包含命名空間導入）
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

      // 多個類型導入與值導入混合
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

      // 帶別名的類型導入
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
