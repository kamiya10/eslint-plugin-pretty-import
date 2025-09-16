import type { Identifier, ImportDeclaration, ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier } from 'estree';
import type { Rule } from 'eslint';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforces separate type imports over inline type imports for better code readability and build optimization',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      separateTypeImport: 'Use `import type` instead of inline type imports for better code readability',
      mixedImport: 'Do not mix type and value imports in the same import statement',
    },
  },

  create(context: Rule.RuleContext) {
    function hasInlineTypeImport(node: ImportDeclaration & { importKind?: 'type' | 'value' }): boolean {
      return node.specifiers?.some((spec) =>
        spec.type === 'ImportSpecifier' && (spec as ImportSpecifier & { importKind?: 'type' }).importKind === 'type',
      ) ?? false;
    }

    function hasValueImport(node: ImportDeclaration & { importKind?: 'type' | 'value' }): boolean {
      return (node.specifiers?.some((spec) =>
        spec.type === 'ImportSpecifier' && (spec as ImportSpecifier & { importKind?: 'type' }).importKind !== 'type',
      ) ?? false) || (node.specifiers?.some((spec) =>
        spec.type === 'ImportDefaultSpecifier' || spec.type === 'ImportNamespaceSpecifier',
      ) ?? false);
    }

    function getAllTypeSpecifiers(node: ImportDeclaration): (ImportSpecifier & { importKind?: 'type' })[] {
      return node.specifiers?.filter((spec): spec is ImportSpecifier & { importKind?: 'type' } =>
        spec.type === 'ImportSpecifier' && (spec as ImportSpecifier & { importKind?: 'type' }).importKind === 'type',
      ) ?? [];
    }

    function getAllValueSpecifiers(node: ImportDeclaration): (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[] {
      return node.specifiers?.filter((spec) => {
        if (spec.type === 'ImportSpecifier') {
          return (spec as ImportSpecifier & { importKind?: 'type' }).importKind !== 'type';
        }
        return true;
      }) ?? [];
    }

    return {
      ImportDeclaration(node) {
        const importNode = node as ImportDeclaration & { importKind?: 'type' | 'value' };
        if (importNode.importKind === 'type') {
          return;
        }

        const hasInlineTypes = hasInlineTypeImport(importNode);
        const hasValues = hasValueImport(importNode);

        if (hasInlineTypes) {
          const typeSpecifiers = getAllTypeSpecifiers(importNode);
          const valueSpecifiers = getAllValueSpecifiers(importNode);

          if (hasValues) {
            context.report({
              node: importNode,
              messageId: 'mixedImport',
              fix(fixer) {
                const source = importNode.source.value as string;

                const typeImports = typeSpecifiers.map((spec) => {
                  const imported = spec.imported as Identifier;
                  const local = spec.local;
                  return local.name !== imported.name
                    ? `${imported.name} as ${local.name}`
                    : imported.name;
                });

                const typeImportStatement = `import type { ${typeImports.join(', ')} } from '${source}';`;

                const valueImports: string[] = [];

                for (const spec of valueSpecifiers) {
                  if (spec.type === 'ImportDefaultSpecifier') {
                    valueImports.push(spec.local.name);
                  }
                  else if (spec.type === 'ImportNamespaceSpecifier') {
                    valueImports.push(`* as ${spec.local.name}`);
                  }
                  else if (spec.type === 'ImportSpecifier') {
                    const imported = spec.imported as Identifier;
                    valueImports.push(
                      spec.local.name !== imported.name
                        ? `${imported.name} as ${spec.local.name}`
                        : imported.name,
                    );
                  }
                }

                let valueImportStatement = '';
                if (valueImports.length > 0) {
                  const defaultImport = valueSpecifiers.find((spec): spec is ImportDefaultSpecifier => spec.type === 'ImportDefaultSpecifier');
                  const namespaceImport = valueSpecifiers.find((spec): spec is ImportNamespaceSpecifier => spec.type === 'ImportNamespaceSpecifier');
                  const namedImports = valueSpecifiers.filter((spec): spec is ImportSpecifier => spec.type === 'ImportSpecifier');

                  const parts: string[] = [];

                  if (defaultImport) {
                    parts.push(defaultImport.local.name);
                  }

                  if (namespaceImport) {
                    parts.push(`* as ${namespaceImport.local.name}`);
                  }

                  if (namedImports.length > 0) {
                    const namedParts = namedImports.map((spec) => {
                      const imported = spec.imported as Identifier;
                      const local = spec.local;
                      return local.name !== imported.name
                        ? `${imported.name} as ${local.name}`
                        : imported.name;
                    });
                    parts.push(`{ ${namedParts.join(', ')} }`);
                  }

                  valueImportStatement = `import ${parts.join(', ')} from '${source}';`;
                }

                const replacement = valueImportStatement
                  ? `${typeImportStatement}\n${valueImportStatement}`
                  : typeImportStatement;

                return fixer.replaceText(importNode, replacement);
              },
            });
          }
          else {
            context.report({
              node: importNode,
              messageId: 'separateTypeImport',
              fix(fixer) {
                const source = importNode.source.value as string;
                const typeImports = typeSpecifiers.map((spec) => {
                  const imported = spec.imported as Identifier;
                  const local = spec.local;
                  return local.name !== imported.name
                    ? `${imported.name} as ${local.name}`
                    : imported.name;
                });

                const typeImportStatement = `import type { ${typeImports.join(', ')} } from '${source}';`;
                return fixer.replaceText(importNode, typeImportStatement);
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
