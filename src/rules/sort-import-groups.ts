import { analyzeImport, formatImportStatement, getImportGroupPriority, groupImports } from '../utils';

import type { ImportDeclaration } from 'estree';
import type { Rule } from 'eslint';

import type { ImportInfo, PluginOptions } from '../types';

export const sortImportGroups: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce grouping and sorting of import statements',
      category: 'Stylistic Issues',
      recommended: false,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          localPatterns: {
            description: 'Array of patterns that identify local modules (e.g., path aliases)',
            type: 'array',
            items: {
              type: 'string',
            },
          },
          groupStyleImports: {
            description: 'Whether to group style (CSS) imports',
            type: 'boolean',
          },
          builtinModulePrefixes: {
            description: 'Array of prefixes that identify built-in modules',
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ], defaultOptions: [
      {
        localPatterns: [],
        groupStyleImports: true,
        builtinModulePrefixes: ['node:', 'bun:'],
      },
    ],
    messages: {
      importGroupsNotSorted: 'Import groups are not sorted correctly',
      unexpectedBlankLine: 'Unexpected blank line within import group',
      missingBlankLine: 'Missing blank line between import groups',
    },
  },

  create(context): Rule.RuleListener {
    const options: PluginOptions & { groupStyleImports?: boolean } = {
      localPatterns: [],
      builtinModulePrefixes: ['node:', 'bun:'],
      groupStyleImports: true,
      ...(context.options[0] as PluginOptions),
    };

    const imports: ImportDeclaration[] = [];

    return {
      ImportDeclaration(node) {
        imports.push(node as ImportDeclaration);
      },

      'Program:exit'() {
        if (imports.length <= 1) return;

        // Skip processing if any import has inline type imports - let separate-type-imports handle those first
        const hasInlineTypes = imports.some((node) => {
          const importNode = node as ImportDeclaration & { importKind?: 'type' | 'value' };
          return importNode.specifiers?.some((spec) =>
            spec.type === 'ImportSpecifier' && (spec as { importKind?: 'type' }).importKind === 'type',
          );
        });

        if (hasInlineTypes) {
          return;
        }

        const importInfos = imports.map((node) => analyzeImport(node, options));

        const cssExtensions = ['.css', '.scss', '.sass', '.less'];
        const cssImports: ImportInfo[] = [];
        const typeImports: ImportInfo[] = [];
        const nonCssImports: ImportInfo[] = [];

        // Separate imports into three categories: regular, type, and CSS
        for (const importInfo of importInfos) {
          const isTypeImport = importInfo.isTypeOnly;
          const isCssImport = options.groupStyleImports && importInfo.isSideEffect && cssExtensions.some((ext) => importInfo.source.endsWith(ext));

          if (isTypeImport) {
            typeImports.push(importInfo);
          }
          else if (isCssImport) {
            cssImports.push(importInfo);
          }
          else {
            nonCssImports.push(importInfo);
          }
        }

        const sections: ImportInfo[][] = [];
        let currentSection: ImportInfo[] = [];

        for (const importInfo of nonCssImports) {
          if (importInfo.isSideEffect) {
            if (currentSection.length > 0) {
              sections.push(currentSection);
              currentSection = [];
            }
            sections.push([importInfo]);
          }
          else {
            currentSection.push(importInfo);
          }
        }

        if (currentSection.length > 0) {
          sections.push(currentSection);
        }

        // Type imports
        if (typeImports.length > 0) {
          const typeGroups = groupImports(typeImports);
          const sortedTypeImports: ImportInfo[] = [];

          for (const group of typeGroups) {
            sortedTypeImports.push(...group.imports);
          }

          sections.push(sortedTypeImports);
        }

        // CSS imports
        if (options.groupStyleImports && cssImports.length > 0) {
          sections.push(cssImports);
        }

        let needsReordering = false;
        const sortedSections: ImportInfo[][] = [];

        for (const section of sections) {
          if (section.length === 1 && section[0]?.isSideEffect) {
            sortedSections.push(section);
          }
          else if (section.length > 0 && section.every((imp) => imp.isSideEffect)) {
            sortedSections.push(section);
          }
          else {
            const groups = groupImports(section);
            const sortedSection: ImportInfo[] = [];

            for (const group of groups) {
              sortedSection.push(...group.imports);
            }

            sortedSections.push(sortedSection);

            for (let i = 0; i < section.length; i++) {
              if (section[i] !== sortedSection[i]) {
                needsReordering = true;
                break;
              }
            }
          }
        }

        if (!needsReordering && options.groupStyleImports) {
          const originalFlattened = importInfos;
          const sortedFlattened = sortedSections.flat();

          if (originalFlattened.length !== sortedFlattened.length) {
            needsReordering = true;
          }
          else {
            for (let i = 0; i < originalFlattened.length; i++) {
              if (originalFlattened[i] !== sortedFlattened[i]) {
                needsReordering = true;
                break;
              }
            }
          }
        }

        if (!needsReordering) {
          const sourceCode = context.sourceCode;

          for (let i = 1; i < importInfos.length; i++) {
            const prevImport = importInfos[i - 1];
            const currentImport = importInfos[i];
            if (!prevImport || !currentImport) continue;

            const prevLine = prevImport.node.loc?.end.line ?? 0;
            const currentLine = currentImport.node.loc?.start.line ?? 0;
            const lineGap = currentLine - prevLine;

            const prevPriority = getImportGroupPriority(prevImport);
            const currentPriority = getImportGroupPriority(currentImport);

            if (prevPriority !== currentPriority) {
              if (lineGap !== 2) {
                context.report({
                  node: currentImport.node as Rule.Node,
                  messageId: lineGap < 2 ? 'missingBlankLine' : 'unexpectedBlankLine',
                  fix(fixer) {
                    const prevToken = sourceCode.getLastToken(prevImport.node as Rule.Node);
                    const currentToken = sourceCode.getFirstToken(currentImport.node as Rule.Node);

                    if (prevToken && currentToken) {
                      return fixer.replaceTextRange([prevToken.range[1], currentToken.range[0]], '\n\n');
                    }
                    return null;
                  },
                });
                return;
              }
            }
            else {
              if (lineGap !== 1) {
                context.report({
                  node: currentImport.node as Rule.Node,
                  messageId: 'unexpectedBlankLine',
                  fix(fixer) {
                    const prevToken = sourceCode.getLastToken(prevImport.node as Rule.Node);
                    const currentToken = sourceCode.getFirstToken(currentImport.node as Rule.Node);

                    if (prevToken && currentToken) {
                      return fixer.replaceTextRange([prevToken.range[1], currentToken.range[0]], '\n');
                    }
                    return null;
                  },
                });
                return;
              }
            }
          }
        }

        if (needsReordering) {
          const firstImport = imports[0];
          const lastImport = imports[imports.length - 1];
          if (!firstImport || !lastImport) return;

          context.report({
            node: firstImport,
            messageId: 'importGroupsNotSorted',
            fix(fixer) {
              const range: [number, number] = [
                (firstImport as ImportDeclaration & { range: [number, number] }).range[0],
                (lastImport as ImportDeclaration & { range: [number, number] }).range[1],
              ];

              const sourceCode = context.sourceCode;
              const program = sourceCode.ast;
              const lastImportIndex = program.body.findIndex((node) => node === lastImport);
              const hasFollowingStatements = lastImportIndex < program.body.length - 1;

              const result: string[] = [];

              for (let sectionIndex = 0; sectionIndex < sortedSections.length; sectionIndex++) {
                const section = sortedSections[sectionIndex];
                if (!section) continue;

                const prevSection = sectionIndex > 0 ? sortedSections[sectionIndex - 1] : null;
                const nextSection = sectionIndex < sortedSections.length - 1 ? sortedSections[sectionIndex + 1] : null;

                if (section.length === 1 && section[0]?.isSideEffect) {
                  // JS side effect river
                  const prevSectionIsRegular = prevSection && !(prevSection.length === 1 && prevSection[0]?.isSideEffect) && !prevSection.every((imp) => imp.isSideEffect);
                  const nextSectionIsRegular = nextSection && !(nextSection.length === 1 && nextSection[0]?.isSideEffect) && !nextSection.every((imp) => imp.isSideEffect);

                  if (prevSectionIsRegular && result.length > 0) {
                    result.push('');
                  }

                  result.push(formatImportStatement(section[0]));

                  if (nextSectionIsRegular) {
                    result.push('');
                  }
                }
                else if (section.length > 0 && section.every((imp) => imp.isSideEffect)) {
                  // CSS section at bottom
                  if (sectionIndex > 0 && result.length > 0) {
                    result.push('');
                  }

                  for (const cssImport of section) {
                    result.push(formatImportStatement(cssImport));
                  }
                }
                else if (section.length > 0 && section.every((imp) => imp.isTypeOnly)) {
                  // Type imports section
                  if (sectionIndex > 0 && result.length > 0) {
                    result.push('');
                  }

                  const groups = groupImports(section);
                  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
                    const group = groups[groupIndex];
                    if (!group) continue;

                    if (groupIndex > 0) {
                      result.push('');
                    }

                    for (const importInfo of group.imports) {
                      result.push(formatImportStatement(importInfo));
                    }
                  }
                }
                else {
                  // Regular import section
                  const groups = groupImports(section);

                  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
                    const group = groups[groupIndex];
                    if (!group) continue;

                    if (groupIndex > 0) {
                      result.push('');
                    }

                    for (const importInfo of group.imports) {
                      result.push(formatImportStatement(importInfo));
                    }
                  }
                }
              }

              let finalResult = result.join('\n');
              if (hasFollowingStatements) {
                const lastSection = sortedSections[sortedSections.length - 1];
                const isLastSectionSideEffect = lastSection?.every((imp) => imp.isSideEffect);
                if (!isLastSectionSideEffect) {
                  finalResult += '\n';
                }
              }

              return fixer.replaceTextRange(range, finalResult);
            },
          });
        }
      },
    };
  },
};
