import type { ImportDeclaration } from 'estree';

export interface ImportInfo {
  node: ImportDeclaration;
  source: string;
  specifiers: ImportSpecifier[];
  importType: ImportType;
  moduleType: ModuleType;
  sortKey: string;
  isTypeOnly: boolean;
  isSideEffect: boolean;
}

export interface ImportSpecifier {
  name: string;
  alias?: string;
  isType: boolean;
  sortKey: string;
}

export enum ImportType {
  Named = 'named',
  Default = 'default',
  Namespace = 'namespace',
  SideEffect = 'side-effect',
  Type = 'type',
}

export enum ModuleType {
  Builtin = 'builtin',
  External = 'external',
  LocalPattern = 'local-pattern',
  Local = 'local',
}

export interface PluginOptions {
  localPatterns?: string[];
  builtinModulePrefixes?: string[];
  enforceBlankLines?: boolean;
  separateTypeImports?: boolean;
}

export interface ImportGroup {
  type: ImportType;
  moduleType: ModuleType;
  imports: ImportInfo[];
  priority: number;
}
