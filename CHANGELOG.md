# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.2]

### Changed

- Updated package scope and username

## [0.0.1] - 2025-09-16

### Added

- Initial release.
- `sort-import-groups` rule with opinionated 6-group hierarchy
- `sort-import-names` rule for alphabetical sorting within import statements
- `separate-type-imports` rule for TypeScript type import separation
- CSS grouping functionality (moves CSS imports to bottom)
- River-based side effects preservation
- Count-based import sorting (more imports get priority)
- Character priority sorting (special chars → UPPERCASE → lowercase)
- Full ESLint v9 flat config support
- Recommended and strict preset configurations
- Support for custom local patterns and builtin module prefixes

### Features

- Opinionated import organization with 6 distinct groups
- CSS import grouping with configurable organization
- JavaScript side effect preservation ("river system")
- TypeScript support with proper type import handling
- Configurable local path patterns
- Case-sensitive and case-insensitive sorting options
- Auto-fixable rules for seamless integration

[unreleased]: https://github.com/kamiya4047/eslint-plugin-pretty-import/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/kamiya4047/eslint-plugin-pretty-import/releases/tag/v0.0.2
[0.0.1]: https://github.com/kamiya4047/eslint-plugin-pretty-import/releases/tag/v0.0.1
