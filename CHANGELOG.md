# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.5] - 2025-09-17

### Fixed

- CSS imports now correctly preserve their relative order instead of being sorted

## [0.1.4] - 2025-09-17

### Fixed

- Type imports are now excluded from side effect boundaries and sorted independently
- Type imports maintain their own grouping section separate from runtime imports

## [0.1.1] - 2025-09-17

### Added

- Added names to shared config presets.

## [0.1.0] - 2025-09-17

### Added

- Added common path alias (`@/`, `~/`, `#/`) to shared config presets

### Fixed

- Fixed TypeScript declaration files not being generated in build output
- Fixed unwanted eslint.config.d.ts being emitted in dist folder

## [0.0.3] - 2025-09-17

### Added

- Added publish to npm registry in workflow file

## [0.0.2] - 2025-09-17

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
- Warn and error preset configurations
- Support for custom local patterns and builtin module prefixes

### Features

- Opinionated import organization with 6 distinct groups
- CSS import grouping with configurable organization
- JavaScript side effect preservation ("river system")
- TypeScript support with proper type import handling
- Configurable local path patterns
- Case-sensitive and case-insensitive sorting options
- Auto-fixable rules for seamless integration

[unreleased]: https://github.com/kamiya4047/eslint-plugin-pretty-import/compare/v0.1.5...HEAD
[0.1.5]: https://github.com/kamiya4047/eslint-plugin-pretty-import/releases/tag/v0.1.5
[0.1.4]: https://github.com/kamiya4047/eslint-plugin-pretty-import/releases/tag/v0.1.4
[0.1.1]: https://github.com/kamiya4047/eslint-plugin-pretty-import/releases/tag/v0.1.1
[0.1.0]: https://github.com/kamiya4047/eslint-plugin-pretty-import/releases/tag/v0.1.0
[0.0.3]: https://github.com/kamiya4047/eslint-plugin-pretty-import/releases/tag/v0.0.3
[0.0.2]: https://github.com/kamiya4047/eslint-plugin-pretty-import/releases/tag/v0.0.2
[0.0.1]: https://github.com/kamiya4047/eslint-plugin-pretty-import/releases/tag/v0.0.1
