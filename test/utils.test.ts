import { expect, test } from 'bun:test';

import { ImportType, ModuleType } from '../src/types';
import { analyzeImportType, createSortKey, formatImportStatement, getImportGroupPriority, getModuleType, sortImportSpecifiers } from '../src/utils';

import type { ImportDeclaration, ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier as ESTREEImportSpecifier, Literal } from 'estree';

import type { ImportInfo, ImportSpecifier } from '../src/types';

test('createSortKey', () => {
  expect(createSortKey('$special')).toBe('0$2s2p2e2c2i2a2l');
  expect(createSortKey('Capital')).toBe('1c2a2p2i2t2a2l');
  expect(createSortKey('lowercase')).toBe('2l2o2w2e2r2c2a2s2e');
  expect(createSortKey('MixedCase')).toBe('1m2i2x2e2d1c2a2s2e');
});

test('getModuleType', () => {
  const options = {
    builtinModulePrefixes: ['node:', 'bun:'],
    localPatterns: ['@/', '~/'],
  };

  expect(getModuleType('node:fs', options)).toBe(ModuleType.Builtin);
  expect(getModuleType('bun:sqlite', options)).toBe(ModuleType.Builtin);
  expect(getModuleType('./local', options)).toBe(ModuleType.Local);
  expect(getModuleType('../local', options)).toBe(ModuleType.Local);
  expect(getModuleType('@/utils', options)).toBe(ModuleType.Local);
  expect(getModuleType('~/components', options)).toBe(ModuleType.Local);
  expect(getModuleType('react', options)).toBe(ModuleType.External);
  expect(getModuleType('lodash', options)).toBe(ModuleType.External);
});

test('analyzeImportType', () => {
  // Side effect import
  const sideEffectNode: ImportDeclaration = {
    type: 'ImportDeclaration',
    specifiers: [],
    source: { type: 'Literal', value: './styles.css', raw: '\'./styles.css\'' } as Literal,
    attributes: [],
  };
  expect(analyzeImportType(sideEffectNode)).toBe(ImportType.SideEffect);

  // Default import
  const defaultNode: ImportDeclaration = {
    type: 'ImportDeclaration',
    specifiers: [{ type: 'ImportDefaultSpecifier' } as ImportDefaultSpecifier],
    source: { type: 'Literal', value: 'react', raw: '\'react\'' } as Literal,
    attributes: [],
  };
  expect(analyzeImportType(defaultNode)).toBe(ImportType.Default);

  // Named import
  const namedNode: ImportDeclaration = {
    type: 'ImportDeclaration',
    specifiers: [{ type: 'ImportSpecifier' } as ESTREEImportSpecifier],
    source: { type: 'Literal', value: 'react', raw: '\'react\'' } as Literal,
    attributes: [],
  };
  expect(analyzeImportType(namedNode)).toBe(ImportType.Named);

  // Namespace import
  const namespaceNode: ImportDeclaration = {
    type: 'ImportDeclaration',
    specifiers: [{ type: 'ImportNamespaceSpecifier' } as ImportNamespaceSpecifier],
    source: { type: 'Literal', value: 'fs', raw: '\'fs\'' } as Literal,
    attributes: [],
  };
  expect(analyzeImportType(namespaceNode)).toBe(ImportType.Namespace);

  // Mixed import (default + named)
  const mixedNode: ImportDeclaration = {
    type: 'ImportDeclaration',
    specifiers: [
      { type: 'ImportDefaultSpecifier' } as ImportDefaultSpecifier,
      { type: 'ImportSpecifier' } as ESTREEImportSpecifier,
    ],
    source: { type: 'Literal', value: 'react', raw: '\'react\'' } as Literal,
    attributes: [],
  };
  expect(analyzeImportType(mixedNode)).toBe(ImportType.Named);
});

test('getImportGroupPriority', () => {
  // Built-in module named import
  const builtinNamedImport: ImportInfo = {
    node: {
      type: 'ImportDeclaration',
      specifiers: [],
      source: { type: 'Literal', value: 'node:fs', raw: '\'node:fs\'' } as Literal,
      attributes: [],
    },
    source: 'node:fs',
    specifiers: [],
    importType: ImportType.Named,
    moduleType: ModuleType.Builtin,
    sortKey: 'fs',
    isTypeOnly: false,
    isSideEffect: false,
  };
  expect(getImportGroupPriority(builtinNamedImport)).toBe(10);

  // External module default import
  const externalDefaultImport: ImportInfo = {
    node: {
      type: 'ImportDeclaration',
      specifiers: [],
      source: { type: 'Literal', value: 'react', raw: '\'react\'' } as Literal,
      attributes: [],
    },
    source: 'react',
    specifiers: [],
    importType: ImportType.Default,
    moduleType: ModuleType.External,
    sortKey: 'react',
    isTypeOnly: false,
    isSideEffect: false,
  };
  expect(getImportGroupPriority(externalDefaultImport)).toBe(40);

  // Local module type import
  const localTypeImport: ImportInfo = {
    node: {
      type: 'ImportDeclaration',
      specifiers: [],
      source: { type: 'Literal', value: './types', raw: '\'./types\'' } as Literal,
      attributes: [],
    },
    source: './types',
    specifiers: [],
    importType: ImportType.Named,
    moduleType: ModuleType.Local,
    sortKey: 'types',
    isTypeOnly: true,
    isSideEffect: false,
  };
  expect(getImportGroupPriority(localTypeImport)).toBe(90);

  // Side effect import
  const sideEffectImport: ImportInfo = {
    node: {
      type: 'ImportDeclaration',
      specifiers: [],
      source: { type: 'Literal', value: './styles.css', raw: '\'./styles.css\'' } as Literal,
      attributes: [],
    },
    source: './styles.css',
    specifiers: [],
    importType: ImportType.SideEffect,
    moduleType: ModuleType.External,
    sortKey: 'styles',
    isTypeOnly: false,
    isSideEffect: true,
  };
  expect(getImportGroupPriority(sideEffectImport)).toBe(100);
});

test('sortImportSpecifiers', () => {
  const specifiers: ImportSpecifier[] = [
    { name: 'z', sortKey: createSortKey('z'), isType: false },
    { name: '$', sortKey: createSortKey('$'), isType: false },
    { name: 'B', sortKey: createSortKey('B'), isType: false },
    { name: 'a', sortKey: createSortKey('a'), isType: false },
  ];

  const sorted = sortImportSpecifiers(specifiers);
  expect(sorted.map((s) => s.name)).toEqual(['$', 'B', 'a', 'z']);
});

test('formatImportStatement', () => {
  // Side effect import
  const sideEffectImport: ImportInfo = {
    node: {
      type: 'ImportDeclaration',
      specifiers: [],
      source: { type: 'Literal', value: './styles.css', raw: '\'./styles.css\'' } as Literal,
      attributes: [],
    } as ImportDeclaration,
    source: './styles.css',
    specifiers: [],
    importType: ImportType.SideEffect,
    moduleType: ModuleType.Local,
    sortKey: 'styles',
    isTypeOnly: false,
    isSideEffect: true,
  };
  expect(formatImportStatement(sideEffectImport)).toBe('import \'./styles.css\';');

  // Default import
  const defaultImport: ImportInfo = {
    node: {
      type: 'ImportDeclaration',
      specifiers: [],
      source: { type: 'Literal', value: 'react', raw: '\'react\'' } as Literal,
      attributes: [],
    } as ImportDeclaration,
    source: 'react',
    specifiers: [{ name: 'default', alias: 'React', sortKey: createSortKey('React'), isType: false }],
    importType: ImportType.Default,
    moduleType: ModuleType.External,
    sortKey: 'React',
    isTypeOnly: false,
    isSideEffect: false,
  };
  expect(formatImportStatement(defaultImport)).toBe('import React from \'react\';');

  // Named import
  const namedImport: ImportInfo = {
    node: {
      type: 'ImportDeclaration',
      specifiers: [],
      source: { type: 'Literal', value: 'react', raw: '\'react\'' } as Literal,
      attributes: [],
    } as ImportDeclaration,
    source: 'react',
    specifiers: [
      { name: 'useState', sortKey: createSortKey('useState'), isType: false },
      { name: 'useEffect', sortKey: createSortKey('useEffect'), isType: false },
    ],
    importType: ImportType.Named,
    moduleType: ModuleType.External,
    sortKey: 'useEffect',
    isTypeOnly: false,
    isSideEffect: false,
  };
  expect(formatImportStatement(namedImport)).toBe('import { useEffect, useState } from \'react\';');

  // Type import
  const typeImport: ImportInfo = {
    node: {
      type: 'ImportDeclaration',
      specifiers: [],
      source: { type: 'Literal', value: './types', raw: '\'./types\'' } as Literal,
      attributes: [],
    } as ImportDeclaration,
    source: './types',
    specifiers: [
      { name: 'User', sortKey: createSortKey('User'), isType: false },
      { name: 'Profile', sortKey: createSortKey('Profile'), isType: false },
    ],
    importType: ImportType.Named,
    moduleType: ModuleType.Local,
    sortKey: 'Profile',
    isTypeOnly: true,
    isSideEffect: false,
  };
  expect(formatImportStatement(typeImport)).toBe('import type { Profile, User } from \'./types\';');

  // Mixed import (default + named)
  const mixedImport: ImportInfo = {
    node: {
      type: 'ImportDeclaration',
      specifiers: [],
      source: { type: 'Literal', value: 'react', raw: '\'react\'' } as Literal,
      attributes: [],
    } as ImportDeclaration,
    source: 'react',
    specifiers: [
      { name: 'default', alias: 'React', sortKey: createSortKey('React'), isType: false },
      { name: 'useState', sortKey: createSortKey('useState'), isType: false },
      { name: 'useEffect', sortKey: createSortKey('useEffect'), isType: false },
    ],
    importType: ImportType.Named,
    moduleType: ModuleType.External,
    sortKey: 'React',
    isTypeOnly: false,
    isSideEffect: false,
  };
  expect(formatImportStatement(mixedImport)).toBe('import React, { useEffect, useState } from \'react\';');

  // Namespace import
  const namespaceImport: ImportInfo = {
    node: {
      type: 'ImportDeclaration',
      specifiers: [],
      source: { type: 'Literal', value: 'fs', raw: '\'fs\'' } as Literal,
      attributes: [],
    } as ImportDeclaration,
    source: 'fs',
    specifiers: [{ name: '*', alias: 'fs', sortKey: createSortKey('fs'), isType: false }],
    importType: ImportType.Namespace,
    moduleType: ModuleType.Builtin,
    sortKey: 'fs',
    isTypeOnly: false,
    isSideEffect: false,
  };
  expect(formatImportStatement(namespaceImport)).toBe('import * as fs from \'fs\';');
});
