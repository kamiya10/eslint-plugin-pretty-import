import { ImportType, ModuleType } from './types';

import type { Identifier, ImportDeclaration, ImportSpecifier as ESTREEImportSpecifier } from 'estree';

import type { ImportGroup, ImportInfo, ImportSpecifier, PluginOptions } from './types';

/**
 * Creates a sort key for import names with character priority: special symbols ($) > uppercase letters > lowercase letters.
 * This ensures consistent alphabetical ordering across different character types.
 *
 * @param name - The import name to create a sort key for
 * @returns A sort key string for consistent alphabetical comparison
 */
export function createSortKey(name: string): string {
  let sortKey = '';
  for (const char of name) {
    if (/[^a-zA-Z0-9]/.test(char)) {
      sortKey += '0' + char;
    }
    else if (/[A-Z]/.test(char)) {
      sortKey += '1' + char.toLowerCase();
    }
    else if (/[a-z]/.test(char)) {
      sortKey += '2' + char;
    }
    else {
      sortKey += '2' + char;
    }
  }
  return sortKey;
}

/**
 * Determines the module type based on import source and configuration options.
 * Classifies modules as built-in, local, or external based on prefixes and patterns.
 *
 * @param source - The import source string (e.g., 'react', './utils', 'node:fs')
 * @param options - Plugin configuration options containing patterns and prefixes
 * @returns The determined module type classification
 */
export function getModuleType(source: string, options: PluginOptions): ModuleType {
  const { builtinModulePrefixes = ['node:', 'bun:'], localPatterns = [] } = options;

  if (builtinModulePrefixes.some((prefix) => source.startsWith(prefix))) {
    return ModuleType.Builtin;
  }

  // Check local patterns first (like @/, ~/, #/)
  for (const pattern of localPatterns) {
    if (source.startsWith(pattern)) {
      return ModuleType.LocalPattern;
    }
  }

  // Check relative/absolute paths
  if (source.startsWith('.') || source.startsWith('/')) {
    return ModuleType.Local;
  }

  return ModuleType.External;
}

/**
 * Analyzes an import AST node to determine its import type.
 * Categorizes imports as side-effect, default, named, or namespace imports.
 *
 * @param node - The ESLint AST node representing an import declaration
 * @returns The determined import type classification
 */
export function analyzeImportType(node: ImportDeclaration): ImportType {
  if (!node.specifiers || node.specifiers.length === 0) {
    return ImportType.SideEffect;
  }

  const hasDefault = node.specifiers.some((spec) => spec.type === 'ImportDefaultSpecifier');
  const hasNamed = node.specifiers.some((spec) => spec.type === 'ImportSpecifier');
  const hasNamespace = node.specifiers.some((spec) => spec.type === 'ImportNamespaceSpecifier');

  if (hasNamespace) {
    return ImportType.Namespace;
  }

  if (hasDefault && !hasNamed) {
    return ImportType.Default;
  }

  if (hasNamed && !hasDefault) {
    return ImportType.Named;
  }

  return ImportType.Named;
}

/**
 * Analyzes import specifiers from an AST node to extract import details.
 * Processes default, named, and namespace import specifiers with their aliases and types.
 *
 * @param node - The ESLint AST node representing an import declaration
 * @returns Array of processed import specifier information
 */
export function analyzeImportSpecifiers(node: ImportDeclaration & { importKind?: 'type' | 'value' }): ImportSpecifier[] {
  if (!node.specifiers) return [];

  return node.specifiers.map((spec) => {
    let name: string;
    let alias: string | undefined;
    let isType = false;

    switch (spec.type) {
      case 'ImportDefaultSpecifier': {
        const defaultSpec = spec;
        name = 'default';
        alias = defaultSpec.local.name;
        break;
      }
      case 'ImportNamespaceSpecifier': {
        const namespaceSpec = spec;
        name = '*';
        alias = namespaceSpec.local.name;
        break;
      }
      case 'ImportSpecifier': {
        const importSpec = spec as ESTREEImportSpecifier & { importKind?: 'type' };
        const imported = importSpec.imported as Identifier;
        name = imported.name;
        alias = importSpec.local.name !== imported.name ? importSpec.local.name : undefined;
        isType = importSpec.importKind === 'type';
        break;
      }
      default:
        name = '';
    }

    return {
      name,
      alias,
      isType,
      sortKey: createSortKey(name === 'default' ? (alias ?? 'default') : name),
    };
  });
}

/**
 * Analyzes a complete import declaration to extract comprehensive import information.
 * Combines module type, import type, specifiers, and generates sort keys for ordering.
 *
 * @param node - The ESLint AST node representing an import declaration
 * @param options - Plugin configuration options for module type determination
 * @returns Comprehensive import information object
 */
export function analyzeImport(node: ImportDeclaration, options: PluginOptions): ImportInfo {
  const importNode = node as ImportDeclaration & { importKind?: 'type' | 'value' };
  const source = (node.source).value as string;
  const moduleType = getModuleType(source, options);
  const importType = analyzeImportType(node);
  const specifiers = analyzeImportSpecifiers(importNode);
  const isTypeOnly = importNode.importKind === 'type';
  const isSideEffect = importType === ImportType.SideEffect;

  let sortKey: string;
  if (isSideEffect) {
    // CSS side effects sort to bottom, as they don't affect JavaScript code logic
    const isCssFile = source.endsWith('.css') || source.endsWith('.scss') || source.endsWith('.sass') || source.endsWith('.less');
    const prefix = isCssFile ? 'zzz_' : '';
    sortKey = prefix + createSortKey(source);
  }
  else if (importType === ImportType.Default) {
    const defaultSpec = specifiers.find((s) => s.name === 'default');
    sortKey = createSortKey(defaultSpec?.alias ?? 'default');
  }
  else if (importType === ImportType.Namespace) {
    const namespaceSpec = specifiers.find((s) => s.name === '*');
    sortKey = createSortKey(namespaceSpec?.alias ?? '*');
  }
  else {
    const namedSpecs = specifiers.filter((s) => s.name !== 'default' && s.name !== '*');
    const firstNamedSpec = namedSpecs[0];
    if (firstNamedSpec) {
      // Priority: more imports first, then alphabetical
      const importCount = namedSpecs.length;
      // Use inverted count as prefix - smaller numbers sort first
      // Pad with zeros to ensure proper sorting (e.g., 10 imports vs 2 imports)
      const countPrefix = (999 - importCount).toString().padStart(3, '0');
      sortKey = countPrefix + firstNamedSpec.sortKey;
    }
    else {
      sortKey = createSortKey(source);
    }
  }

  return {
    node,
    source,
    specifiers,
    importType,
    moduleType,
    sortKey,
    isTypeOnly,
    isSideEffect,
  };
}

/**
 * Calculates the priority number for import grouping and ordering.
 * Lower numbers indicate higher priority in the final import order.
 * Based on the specification:
 * 1. Named imports from external modules
 * 2. Default imports from external modules
 * 3. Named imports from local modules
 * 4. Default imports from local modules
 * 5. All imports from external modules (namespace)
 * 6. All imports from local modules (namespace)
 * 7. Type imports from external modules
 * 8. Type imports from local modules
 * 9. Side-effect imports
 *
 * @param importInfo - The analyzed import information object
 * @returns Numeric priority value for import ordering
 */
export function getImportGroupPriority(importInfo: ImportInfo): number {
  const { importType, moduleType, isTypeOnly } = importInfo;

  if (importInfo.isSideEffect) {
    return 1000;
  }

  // New 6-group specification:
  // 1. Builtins (10-19)
  // 2. External (20-29)
  // 3. LocalPatterns (30-39)
  // 4. Local (40-49)
  // 5. Namespace (50-59)
  // 6. Types (60-69)

  if (isTypeOnly) {
    // Group 6: Types
    switch (moduleType) {
      case ModuleType.External: return 60;
      case ModuleType.LocalPattern: return 61;
      case ModuleType.Local: return 62;
      default: return 65;
    }
  }

  switch (moduleType) {
    case ModuleType.Builtin:
      // Group 1: Builtins
      switch (importType) {
        case ImportType.Named: return 10;
        case ImportType.Default: return 11;
        default: return 15;
      }
    case ModuleType.External:
      // Group 2: External
      switch (importType) {
        case ImportType.Named: return 20;
        case ImportType.Default: return 21;
        case ImportType.Namespace: return 50; // Group 5: Namespace external
        default: return 25;
      }
    case ModuleType.LocalPattern:
      // Group 3: LocalPatterns
      switch (importType) {
        case ImportType.Named: return 30;
        case ImportType.Default: return 31;
        case ImportType.Namespace: return 51; // Group 5: Namespace local pattern
        default: return 35;
      }
    case ModuleType.Local:
      // Group 4: Local
      switch (importType) {
        case ImportType.Named: return 40;
        case ImportType.Default: return 41;
        case ImportType.Namespace: return 52; // Group 5: Namespace local
        default: return 45;
      }
    default:
      return 999;
  }
}

/**
 * Groups imports by priority while excluding side effect imports from reordering.
 * Side effect imports maintain their original positions to preserve execution order.
 *
 * @param imports - Array of analyzed import information objects
 * @returns Array of import groups sorted by priority
 */
export function groupImports(imports: ImportInfo[]): ImportGroup[] {
  const groups = new Map<number, ImportGroup>();

  // Filter out side effect imports, they will maintain their original positions
  const nonSideEffectImports = imports.filter((importInfo) => !importInfo.isSideEffect);

  for (const importInfo of nonSideEffectImports) {
    const priority = getImportGroupPriority(importInfo);

    if (!groups.has(priority)) {
      groups.set(priority, {
        type: importInfo.importType,
        moduleType: importInfo.moduleType,
        imports: [],
        priority,
      });
    }

    groups.get(priority)!.imports.push(importInfo);
  }

  // Sort imports within each group
  for (const group of groups.values()) {
    group.imports.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }

  // Sort groups by priority
  return Array.from(groups.values()).sort((a, b) => a.priority - b.priority);
}

/**
 * Sorts import specifiers alphabetically using their generated sort keys.
 * Maintains the original array while returning a new sorted array.
 *
 * @param specifiers - Array of import specifier objects to sort
 * @returns New array of specifiers sorted alphabetically
 */
export function sortImportSpecifiers(specifiers: ImportSpecifier[]): ImportSpecifier[] {
  return [...specifiers].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

/**
 * Formats an import information object back into a valid import statement string.
 * Handles all import types including default, named, namespace, type, and side-effect imports.
 *
 * @param importInfo - The import information object to format
 * @returns Formatted import statement string
 */
export function formatImportStatement(importInfo: ImportInfo): string {
  const { source, specifiers, isTypeOnly, isSideEffect } = importInfo;

  if (isSideEffect) {
    return `import '${source}';`;
  }

  const typePrefix = isTypeOnly ? 'type ' : '';
  const sortedSpecifiers = sortImportSpecifiers(specifiers);

  if (sortedSpecifiers.length === 0) {
    return `import ${typePrefix}'${source}';`;
  }

  if (sortedSpecifiers.length === 1) {
    const spec = sortedSpecifiers[0];
    if (!spec) return `import ${typePrefix}'${source}';`;
    if (spec.name === 'default') {
      return `import ${typePrefix}${spec.alias ?? 'default'} from '${source}';`;
    }
    else if (spec.name === '*') {
      return `import ${typePrefix}* as ${spec.alias ?? '*'} from '${source}';`;
    }
  }

  const defaultImports: string[] = [];
  const namedImports: string[] = [];
  let namespaceImport: string | null = null;

  for (const spec of sortedSpecifiers) {
    if (spec.name === 'default') {
      defaultImports.push(spec.alias ?? 'default');
    }
    else if (spec.name === '*') {
      namespaceImport = `* as ${spec.alias}`;
    }
    else {
      const importStr = spec.alias ? `${spec.name} as ${spec.alias}` : spec.name;
      namedImports.push(importStr);
    }
  }

  const importParts: string[] = [];

  if (defaultImports.length > 0) {
    const firstDefault = defaultImports[0];
    if (firstDefault) importParts.push(firstDefault);
  }

  if (namespaceImport) {
    importParts.push(namespaceImport);
  }

  if (namedImports.length > 0) {
    importParts.push(`{ ${namedImports.join(', ')} }`);
  }

  return `import ${typePrefix}${importParts.join(', ')} from '${source}';`;
}
