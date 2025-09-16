import { RuleTester } from 'eslint';

import parser from '@typescript-eslint/parser';

export const ruleTester = new RuleTester({
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

export interface TestCase {
  code: string;
  options?: unknown[];
  errors?: {
    messageId?: string;
    message?: string;
    line?: number;
    column?: number;
  }[];
  output?: string;
}

export interface RuleTest {
  valid: (string | TestCase)[];
  invalid: TestCase[];
}
