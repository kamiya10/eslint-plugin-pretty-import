import { createSortKey } from '../utils';

import type { Identifier, ImportDeclaration, ImportSpecifier as ESTREEImportSpecifier } from 'estree';
import type { Rule } from 'eslint';

import type { ImportSpecifier, PluginOptions } from '../types';

export const sortImportNames: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce sorted named imports within import statements',
      category: 'Stylistic Issues',
      recommended: false,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          caseInsensitive: {
            description: 'Case insensitive sorting',
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [
      { caseInsensitive: false },
    ],
    messages: {
      importNamesNotSorted: 'Import names are not sorted correctly',
    },
  },

  create(context): Rule.RuleListener {
    const options: { caseInsensitive?: boolean } = {
      caseInsensitive: false,
      ...(context.options[0] as PluginOptions),
    };

    function createSortKeyWithCase(name: string): string {
      if (options.caseInsensitive) {
        return createSortKey(name.toLowerCase());
      }
      return createSortKey(name);
    }

    function analyzeImportSpecifiers(node: ImportDeclaration): ImportSpecifier[] {
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
          sortKey: createSortKeyWithCase(name === 'default' ? (alias ?? 'default') : name),
        };
      });
    }

    function formatImportSpecifiers(specifiers: ImportSpecifier[]): string {
      if (specifiers.length === 0) return '';

      if (specifiers.length === 1) {
        const spec = specifiers[0];
        if (!spec) return '';

        if (spec.name === 'default') {
          return spec.alias ?? 'default';
        }
        else if (spec.name === '*') {
          return `* as ${spec.alias ?? '*'}`;
        }
        else {
          return spec.alias ? `{ ${spec.name} as ${spec.alias} }` : `{ ${spec.name} }`;
        }
      }

      const defaultImports: string[] = [];
      const namedImports: string[] = [];
      let namespaceImport: string | null = null;

      for (const spec of specifiers) {
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

      return importParts.join(', ');
    }

    return {
      ImportDeclaration(node) {
        const importNode = node as ImportDeclaration;

        // Skip side effect imports (no specifiers)
        if (!importNode.specifiers || importNode.specifiers.length === 0) {
          return;
        }

        // Skip imports with only one specifier
        if (importNode.specifiers.length <= 1) {
          return;
        }

        // Skip if this import has inline type imports - let separate-type-imports handle it first
        const hasInlineTypes = importNode.specifiers?.some((spec) =>
          spec.type === 'ImportSpecifier' && (spec as { importKind?: 'type' }).importKind === 'type',
        );

        if (hasInlineTypes) {
          return;
        }

        const specifiers = analyzeImportSpecifiers(importNode);
        const sortedSpecifiers = [...specifiers].sort((a, b) => a.sortKey.localeCompare(b.sortKey));

        // Check if specifiers are already sorted
        let needsSorting = false;
        for (let i = 0; i < specifiers.length; i++) {
          if (specifiers[i] !== sortedSpecifiers[i]) {
            needsSorting = true;
            break;
          }
        }

        if (needsSorting) {
          context.report({
            node: importNode,
            messageId: 'importNamesNotSorted',
            fix(fixer) {
              const sourceCode = context.sourceCode;
              const source = sourceCode.getText(importNode.source);
              const importNodeWithKind = importNode as ImportDeclaration & { importKind?: 'type' | 'value' };
              const importKeyword = importNodeWithKind.importKind === 'type' ? 'import type' : 'import';

              const sortedSpecifiersText = formatImportSpecifiers(sortedSpecifiers);
              const newImportText = `${importKeyword} ${sortedSpecifiersText} from ${source};`;

              return fixer.replaceText(importNode, newImportText);
            },
          });
        }
      },
    };
  },
};
