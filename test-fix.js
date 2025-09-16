import { ESLint } from 'eslint';
import prettyImport from './dist/index.js';

const eslint = new ESLint({
  baseConfig: {
    plugins: {
      'pretty-import': prettyImport
    },
    rules: {
      'pretty-import/sort-imports': ['error', {
        enforceBlankLines: true
      }]
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    }
  },
  overrideConfigFile: true
});

const testCode = `import type { User } from './api/structure/user';
import * as schema from './database/schema';
import MyButtonComponent from './components/button';
import { offset } from './database/utils';
import NextAuth from 'next-auth';
import { named } from 'external-module';
import * as fs from 'fs';
import type { Metadata } from 'next';
import http from 'node:http';
import { mkdir } from 'node:fs';`;

async function test() {
  try {
    const results = await eslint.lintText(testCode, { filePath: 'test.js' });
    const result = results[0];
    
    if (result.messages.length > 0) {
      console.log('Issues found:');
      result.messages.forEach(msg => {
        console.log(`  ${msg.line}:${msg.column} ${msg.message}`);
      });
      
      if (result.output) {
        console.log('\nFixed code:');
        console.log(result.output);
      }
    } else {
      console.log('No issues found - code is already sorted correctly!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

test();